class ProductsController < ApplicationController
  skip_before_action :verify_authenticity_token  # API endpoints don't need CSRF protection
  # attributes to include when rendering product JSON, %i mean ":" for all items
  PRODUCT_JSON_ONLY = %i[id name description price seller_id buyer_id status category_id location contact condition created_at updated_at].freeze

  # directly get the product list
  before_action :set_product, only: %i[show update destroy]
  before_action :authenticate_user!, only: %i[create update destroy]
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

    if params[:keywords].present?
      products = products.search_by_name(params[:keywords])
    end

    if params[:college].present?
      products = products.joins(:seller).where(users: { college: params[:college] })
    end 

    if params[:type].present?
      products = products.joins(:category).where(categories: { category_name: params[:type] })
    end

    total_count = products.count
    paginated_products = products.limit(limit).offset(offset)
    
    formatted_data = paginated_products.map { |p| format_product(p) }

    render json: {
      data: formatted_data,
      pagination: {
        current_page: page,
        limit: limit,
        total_count: total_count,
        total_pages: (total_count.to_f / limit).ceil
      }
    }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  # GET /products/:id
  # show a single product
  # in product info page
  def show
    product_data = @product.as_json(only: PRODUCT_JSON_ONLY)

    product_data["images"] = if @product.images.attached?
                               @product.images.map { |img| img.service_url }
                             else
                               []
                             end

    render json: product_data
  end

  # POST /products
  # create product (basic implementation)
  def create
    product = Product.new(product_params)
    product.seller_id = current_user.id
    # Handle image uploads
    if params[:images].present?
      params[:images].each do |image|
        product.images.attach(image) if image.is_a?(ActionDispatch::Http::UploadedFile)
      end
    end
    if product.save
      product.reload # Reload to ensure images are properly loaded
      render json: format_product(product), status: :created
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
    # Update product attributes if provided
    if params[:product].present?
      unless @product.update(product_params)
        render_error(@product.errors, status: :unprocessable_content)
        return
      end
    end

    # Replace images if new ones provided
    if params[:images].present?
      @product.images.purge # Remove old images
      params[:images].each do |image|
        @product.images.attach(image) if image.is_a?(ActionDispatch::Http::UploadedFile)
      end
      @product.reload # Reload to get attached images
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
    head :no_content     # return 204 No Content on successful deletion
  rescue StandardError => e
    render_error(e)
  end

  # GET /products/:id/price_history
  # Returns price history records for a product.
  # Query param `points` controls number of data points (default 10, max 20).
  def price_history
    product_id = params[:product_id] || params[:id]
    unless product_id.present?
      render_error('product_id query parameter required', status: :bad_request)
      return
    end

    product = Product.find(product_id)

    points = (params[:points] || 10).to_i
    points = 10 if points <= 0
    # maximum 20 points
    points = [points, 20].min

    # Fetch price history records, ordered by date descending (most recent first)
    price_histories = product.price_histories.order(date: :desc).limit(points)

    render json: { 
      product_id: product.id, 
      prices: price_histories.map { |ph| ph.price }
    }, status: :ok
  rescue StandardError => e
    render_error(e)
  end

  private

  # directly find the product by id for show, update, destroy, and price_history actions
  def set_product
    @product = Product.find(params[:id])
  end

  def authorize_product_seller!
    unless @product.seller_id == current_user.id
      render_unauthorized
    end
  end

  def product_params
    params.require(:product).permit(
      %i[name description price seller_id category_id location 
      contact status condition buyer_id])
  end

  def format_product(product)
    {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      seller_id: product.seller_id,
      buyer_id: product.buyer_id,
      status: product.status,
      category_id: product.category_id,
      location: product.location,
      contact: product.contact,
      condition: product.condition,
      images: product.images.map { |img| safe_url_for(img) }.compact,
      created_at: product.created_at,
      updated_at: product.updated_at
    }
  end

  def safe_url_for(blob)
    url_for(blob)
  rescue StandardError
    nil
  end
end
