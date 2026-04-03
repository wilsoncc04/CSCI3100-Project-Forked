class ProductsController < ApplicationController
  skip_before_action :verify_authenticity_token  # API endpoints don't need CSRF protection
  # attributes to include when rendering product JSON, %i mean ":" for all items
  PRODUCT_JSON_ONLY = %i[id name description price seller_id buyer_id status category_id location contact condition created_at updated_at].freeze

  # directly get the product list
  before_action :set_product, only: %i[show update destroy price_history]
  before_action :authenticate_user!, only: %i[create update destroy selling]
  before_action :authorize_product_seller!, only: %i[update destroy]

  # GET /products
  # show the first X products, where X is determined by a query parameter, default 15
  # supports pagination via `page` and `limit` parameters
  # supports `keywords` for fuzzy search (using trigram matching on product name)
  def index
    limit = (params[:limit] || 15).to_i
    limit = 15 if limit <= 0
    
    page = (params[:page] || 1).to_i
    page = 1 if page <= 0
    offset = (page - 1) * limit

    products = Product.with_attached_images.includes(:seller).all
    products = products.search_by_name(params[:keywords]) if params[:keywords].present?
    products = products.joins(:seller).where(users: { college: params[:college] }) if params[:college].present?
    products = products.joins(:category).where(categories: { category_name: params[:type] }) if params[:type].present?

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
  # show a single product
  # in product info page
  def show
    render json: format_product(@product)
  end

  # POST /products
  # create product (basic implementation)
  def create
    product = Product.new(product_params)
    product.seller_id = current_user.id
    
    # Handle image uploads
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
  # update product details
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
  rescue ActionController::ParameterMissing => e
    render_error(e.message, status: :bad_request)
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
  # Returns products currently being sold by the authenticated user
  def selling
    products = Product.with_attached_images.where(seller_id: current_user.id)
    render json: products.map { |p| format_product(p) }, status: :ok
  rescue StandardError => e
    render_error(e)
  end

  # GET /products/:id/price_history
  # Returns price history records for a product.
  # Query param `points` controls number of data points (default 10, max 20).
  def price_history
    points = (params[:points] || 10).to_i
    points = [points, 1].max
    points = [points, 20].min

    price_histories = @product.price_histories.order(date: :desc).limit(points)

    render json: { 
      product_id: @product.id, 
      prices: price_histories.map(&:price)
    }, status: :ok
  rescue StandardError => e
    render_error(e)
  end

  private

  # directly find the product by id for show, update, destroy, and price_history actions
  def set_product
    @product = Product.with_attached_images.find(params[:id])
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

  # for community promotion(add description)
  def promote_to_community(product)
    return unless params[:community_description].present?

    CommunityItem.create!(
      user: current_user,
      product: product,
      description: params[:community_description],
      college: current_user.college || "Unknown"
    )
  rescue ActiveRecord::RecordInvalid => e
    logger.error "CommunityItem creation failed: #{e.message}"
  end
end
