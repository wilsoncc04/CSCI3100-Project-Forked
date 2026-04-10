class ProductsController < ApplicationController
  skip_before_action :verify_authenticity_token

  PRODUCT_JSON_ONLY = %i[id name description price seller_id buyer_id status category_id location contact condition created_at updated_at].freeze

  before_action :set_product, only: %i[show update destroy toggle_interest buy]
  before_action :authenticate_user!, only: %i[create update destroy selling toggle_interest buy]
  before_action :authorize_product_seller!, only: %i[update]
  before_action :authorize_product_destroy!, only: %i[destroy]

  # GET /products
  def index
    products = Product.with_attached_images.includes(:seller).all
    products = products.search_by_name(params[:keywords]) if params[:keywords].present?
    products = products.joins(:category).where(categories: { category_name: params[:type] }) if params[:type].present?

    if params[:college].present? || params[:hall].present?
      products = products.joins(:seller)
      products = products.where(users: { college: params[:college] }) if params[:college].present?
      products = products.where(users: { hostel: params[:hall] }) if params[:hall].present?
    end

    case params[:sort_by]
    when "price_asc"
      products = products.reorder(price: :asc)
    when "price_desc"
      products = products.reorder(price: :desc)
    when "date_asc"
      products = products.reorder(created_at: :asc)
    when "date_desc"
      products = products.reorder(created_at: :desc)
    end

    total_count = products.count

    if params[:fetch_all] == "true"
      paginated_products = products
      page = 1
      limit = total_count
    else
      limit = (params[:limit] || 15).to_i
      limit = 15 if limit <= 0

      page = (params[:page] || 1).to_i
      page = 1 if page <= 0
      offset = (page - 1) * limit

      paginated_products = products.limit(limit).offset(offset)
    end

    render json: {
      data: paginated_products.map { |p| format_product(p) },
      pagination: {
        current_page: page,
        limit: limit,
        total_count: total_count,
        total_pages: (total_count.to_f / limit).ceil
      }
    }
  rescue StandardError => e
    render_error(e)
  end

  # GET /products/:id
  def show
    is_liked = false
    is_owner = false
    can_delete = false
    if current_user
      is_liked = Interest.exists?(interested_id: current_user.id, item_id: @product.id)
      is_owner = current_user.id == @product.seller_id
      can_delete = is_owner || current_user_admin?
    end
    community_info = CommunityItem.find_by(product_id: @product.id)
    render json: format_product(@product).merge(
      is_liked: is_liked,
      is_owner: is_owner,
      can_delete: can_delete,
      promote_to_community: community_info.present?,
      community_description: community_info&.description || ""
    )
  end

  # POST /products
  def create
    product = Product.new(product_params)
    product.seller_id = current_user.id
    attach_images(product, params[:images]) if params[:images].present?

    if product.save
      handle_community_promotion(product)
      render json: format_product(product.reload), status: :created
    else
      render_error(product.errors, status: :unprocessable_content)
    end
  rescue ActionController::ParameterMissing => e
    render_error(e.message, status: :bad_request)
  rescue StandardError => e
    render_error(e)
  end

  # PATCH/PUT /products/:id
  def update
    # Handle chat cancellation from either participant.
    if params[:action_type] == 'cancel_chat'
      chat = Chat.find_by(id: params[:chat_id])

      if chat && (chat.seller_id == current_user.id || chat.interested_id == current_user.id)
        product_id = chat.item_id
        chat.destroy

        # If no one is queued, return product to available state.
        unless Chat.exists?(item_id: product_id)
          Product.find(product_id).update(status: 'available', buyer_id: nil)
        end

        render json: { message: 'Chat closed successfully' }, status: :ok and return
      else
        render json: { error: 'Unauthorized or Chat not found' }, status: :unauthorized and return
      end
    end

    unless @product.seller_id == current_user.id
      render_unauthorized and return
    end

    ActiveRecord::Base.transaction do
      if params[:product] && params[:product][:status] == 'sold'
        # 1. 更新產品狀態與最終買家
        @product.update!(status: 'sold', buyer_id: params[:product][:buyer_id])
        
        # 2. 自動刪除「除了最終買家以外」的所有相關聊天室
        Chat.where(item_id: @product.id).where.not(interested_id: params[:product][:buyer_id]).destroy_all
        
        render json: format_product(@product), status: :ok and return
      end

      if @product.update(update_product_params)
        if params[:images].present? || params.key?(:keep_images)
          keep_urls = Array(params[:keep_images])
          @product.images.each do |img|
            img_path = rails_blob_path(img, only_path: true)
            img.purge unless keep_urls.include?(img_path)
          end
          attach_images(@product, params[:images]) if params[:images].present?
        end

        @product.reload
        handle_community_promotion(@product)
        render json: format_product(@product), status: :ok
      else
        render json: { error: @product.errors.full_messages }, status: :unprocessable_content
      end
    end
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_content
  end

  # DELETE /products/:id
  def destroy
    @product.destroy
    head :no_content
  rescue StandardError => e
    render_error(e)
  end

  # GET /products/selling
  def selling
    products = Product.with_attached_images.where(seller_id: current_user.id)
    render json: products.map { |p| format_product(p) }, status: :ok
  end

  # POST /products/:id/buy
  def buy
    if @product.seller_id == current_user.id
      render_error("cannot_buy_own_product", status: :forbidden)
      return
    end

    if %w[sold reserved].include?(@product.status.to_s.downcase)
      render_error("product_unavailable", status: :unprocessable_entity)
      return
    end

    ActiveRecord::Base.transaction do
      # 如果原本是 available，改為 reserved 但不鎖定 buyer_id
      if @product.status == 'available'
        @product.update!(status: "reserved")
      end

      # 建立或尋找聊天室
      chat = Chat.find_or_create_by!(
        item_id: @product.id,
        seller_id: @product.seller_id,
        interested_id: current_user.id
      )

      # 建立系統訊息（若還未發送過）
      unless chat.messages.exists?(sender_id: current_user.id)
        Message.create!(
          chat_id: chat.id,
          sender_id: current_user.id,
          message: "I want to buy \"#{@product.name}\". (System: Request sent)"
        )
      end

      render json: {
        chat_id: chat.id,
        product_name: @product.name,
        message: "Purchase request sent via chat"
      }, status: :ok
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: "Validation failed: #{e.record.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
  rescue => e
    Rails.logger.error "Purchase Error: #{e.message}"
    render json: { error: "Something went wrong." }, status: :internal_server_error
  end

  # POST /products/:id/interest (Toggle Liked)
  def toggle_interest
    interest = Interest.find_by(interested_id: current_user.id, item_id: @product.id)
    if interest
      interest.destroy
      render json: { status: "unliked", message: "Removed from interests" }, status: :ok
    else
      Interest.create!(interested_id: current_user.id, item_id: @product.id)
      render json: { status: "liked", message: "Added to interests" }, status: :ok
    end
  end

  # GET /products/:id/price_history
  def price_history
    product_id = params[:product_id].presence || params[:id].presence
    return render_error("product_id is required", status: :bad_request) if product_id.blank?

    product = Product.find_by(id: product_id)
    return render_error("Product not found", status: :not_found) unless product

    points = (params[:points] || 10).to_i
    points = 10 if points <= 0
    points = [ points, 20 ].min
    
    if product.category_id.present?
      category_histories = PriceHistory.joins(:product)
                                       .where(products: { category_id: product.category_id })
                                       .order(date: :desc)
      if category_histories.any?
        daily_averages = category_histories.group_by { |h| h.date.to_date }.map do |date, records|
          { date: date, price: (records.sum(&:price).to_f / records.size).round(2) }
        end.take(points)

        render json: {
          type: "category",
          product_id: product.id,
          category_name: product.category&.category_name,
          history: daily_averages,
          prices: daily_averages.map { |e| e[:price] }
        } and return
      end
    end

    history = product.price_histories.order(date: :desc).limit(points).map { |e| { date: e.date, price: e.price.to_f } }
    render json: { type: "product", product_id: product.id, history: history, prices: history.map { |e| e[:price] } }
  end

  private

  def set_product
    @product = Product.with_attached_images.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error("Product not found", status: :not_found)
  end

  def authorize_product_seller!
    # For chat cancellation, allow either chat participant.
    if params[:action_type] == 'cancel_chat'
      chat = Chat.find_by(id: params[:chat_id])
      return if chat && (chat.seller_id == current_user.id || chat.interested_id == current_user.id)
    end

    render_unauthorized unless @product.seller_id == current_user.id
  end

  def authorize_product_destroy!
    return if @product.seller_id == current_user.id || current_user_admin?
    render_unauthorized
  end

  def product_params
    params.require(:product).permit(%i[name description price seller_id category_id location contact status condition buyer_id])
  end

  def update_product_params
    return {} unless params[:product].present?

    product_params
  end

  def format_product(product)
    product.as_json(only: PRODUCT_JSON_ONLY).merge(
      "images" => product.images.map { |img| rails_blob_path(img, only_path: true) }
    )
  end

  def attach_images(product, images)
    images.each do |image|
      product.images.attach(image) if image.is_a?(ActionDispatch::Http::UploadedFile)
    end
  end

  def handle_community_promotion(product)
    promote_to_community = params[:promote_to_community]
    description = params[:community_description]
    return if promote_to_community.nil? && description.nil?

    if ActiveModel::Type::Boolean.new.cast(promote_to_community) && description.present?
      item = CommunityItem.find_or_initialize_by(product: product)
      item.assign_attributes(user: current_user, description: description, college: current_user.college || "Unknown")
      item.save!
    else
      CommunityItem.find_by(product: product)&.destroy
    end
  end
end