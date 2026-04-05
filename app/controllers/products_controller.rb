class ProductsController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  PRODUCT_JSON_ONLY = %i[id name description price seller_id buyer_id status category_id location contact condition created_at updated_at].freeze

  before_action :set_product, only: %i[show update destroy price_history toggle_interest buy]
  before_action :authenticate_user!, only: %i[create update destroy selling toggle_interest buy]
  before_action :authorize_product_seller!, only: %i[update destroy]

  # GET /products
  def index
    limit = (params[:limit] || 15).to_i
    limit = 15 if limit <= 0
    
    page = (params[:page] || 1).to_i
    page = 1 if page <= 0
    offset = (page - 1) * limit

    products = Product.with_attached_images.includes(:seller).all
    products = products.search_by_name(params[:keywords]) if params[:keywords].present?
    products = products.joins(:category).where(categories: { category_name: params[:type] }) if params[:type].present?

    if params[:college].present? || params[:hall].present?
      products = products.joins(:seller)
      products = products.where(users: { college: params[:college] }) if params[:college].present?
      products = products.where(users: { hall: params[:hall] }) if params[:hall].present?
    end
    
    total_count = products.count
    paginated_products = products.limit(limit).offset(offset)
    
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
    if current_user
      is_liked = Interest.exists?(interested_id: current_user.id, item_id: @product.id)
    end
    render json: format_product(@product).merge(is_liked: is_liked)
  end

  # POST /products
  def create
    product = Product.new(product_params)
    product.seller_id = current_user.id
    attach_images(product, params[:images]) if params[:images].present?

    if product.save
      promote_to_community(product) if params[:promote_to_community] == 'true'
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
    if params[:product].present?
      unless @product.update(product_params)
        render_error(@product.errors, status: :unprocessable_content)
        return
      end
    end

    if params[:images].present?
      @product.images.purge
      attach_images(@product, params[:images])
      @product.reload
    end

    render json: format_product(@product), status: :ok
  rescue StandardError => e
    render_error(e)
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

  # GET /products/:id/price_history
  def price_history
    points = (params[:points] || 10).to_i
    points = [[points, 1].max, 20].min
    price_histories = @product.price_histories.order(date: :desc).limit(points)

    render json: { 
      product_id: @product.id, 
      prices: price_histories.map(&:price)
    }, status: :ok
  end

  # POST /products/:id/interest
  def toggle_interest
    interest = Interest.find_by(interested_id: current_user.id, item_id: @product.id)
    if interest
      interest.destroy
      render json: { status: 'unliked', message: 'Removed from interests' }, status: :ok
    else
      Interest.create!(interested_id: current_user.id, item_id: @product.id)
      render json: { status: 'liked', message: 'Added to interests' }, status: :ok
    end
  end

  # POST /products/:id/buy
  def buy
  @product = Product.find(params[:id])
  
  ActiveRecord::Base.transaction do
    # 1. 更新產品狀態
    @product.update!(status: 'reserved', buyer_id: current_user.id)

    # 2. 建立或尋找聊天室
    chat = Chat.find_or_create_by!(
      item_id: @product.id,
      seller_id: @product.seller_id,
      interested_id: current_user.id
    )

    # 3. 直接建立一條 Message 作為「通知」
    # 這樣賣家進到聊天列表就能看到這條訊息
    Message.create!(
      chat_id: chat.id,
      sender_id: current_user.id,
      message: "I want to buy \"#{@product.name}\". System: Request sent."
    )

    render json: { 
      chat_id: chat.id, 
      product_name: @product.name,
      message: 'Purchase request sent via chat' 
    }, status: :ok
  end
  rescue ActiveRecord::RecordInvalid => e
    # This catches validation errors specifically and tells you WHICH one failed
    render json: { error: "Validation failed: #{e.record.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
  rescue => e
    # Logs the error to Heroku logs so you can see it
    Rails.logger.error "Purchase Error: #{e.message}"
    render json: { error: "Something went wrong. Please try again." }, status: :internal_server_error
  end

  private

  def set_product
    @product = Product.with_attached_images.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('Product not found', status: :not_found)
  end

  def authorize_product_seller!
    render_unauthorized unless @product.seller_id == current_user.id
  end

  def product_params
    params.require(:product).permit(
      %i[name description price seller_id category_id location 
      contact status condition buyer_id])
  end

  def format_product(product)
    product.as_json(only: PRODUCT_JSON_ONLY).merge(
      "images" => product.image_urls
    )
  end

  def attach_images(product, images)
    images.each do |image|
      product.images.attach(image) if image.is_a?(ActionDispatch::Http::UploadedFile)
    end
  end

  def promote_to_community(product)
    return unless params[:community_description].present?
    CommunityItem.create!(
      user: current_user,
      product: product,
      description: params[:community_description],
      college: current_user.college || "Unknown"
    )
  rescue => e
    logger.error "CommunityItem creation failed: #{e.message}"
  end
end