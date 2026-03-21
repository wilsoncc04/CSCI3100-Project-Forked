class ProductsController < ApplicationController
  # attributes to include when rendering product JSON, %i mean ":" for all items
  PRODUCT_JSON_ONLY = %i[id name description price seller_id buyer_id status category_id location contact created_at updated_at].freeze

  # directly get the product list
  before_action :set_product, only: %i[show update destroy]

  # GET /products
  # show the first X products, where X is determined by a query parameter, default 15
  # supports `q` for simple fuzzy search (name or description)
  def index
    limit = (params[:limit] || 15).to_i
    limit = 15 if limit <= 0

    products = Product.all
    # basic search, not Fuzzy search
    if params[:q].present?
      q = "%#{params[:q]}%"
      products = products.where('name LIKE ? OR description LIKE ?', q, q)
    end

    products = products.limit(limit)
    render json: products.as_json(only: PRODUCT_JSON_ONLY)
  rescue StandardError => e
    render_error(e)
  end

  # GET /products/:id
  # show a single product
  # in product info page
  def show
    render json: @product.as_json(only: PRODUCT_JSON_ONLY)
  end

  # POST /products
  # create product (basic implementation)
  def create
    product = Product.new(product_params)
    # Handle image uploads
    if params[:images].present?
      # leave here, finish it after implementing image upload

    if product.save
      render json: format_product(product), status: :created
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  rescue StandardError => e
    render_error(e)
  end

  # PATCH/PUT /products/:id
  # update product details
  def update
     # Replace images if new ones provided
    if params[:images].present?
      # leave here, finish it after implementing image upload
    end

    if @product.update(product_params)
      render json: format_product(@product),  status: :ok
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
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
  # Returns a simple synthetic price history as an array of prices only.
  # Query param `points` controls number of data points (default 10).
  def price_history
    product_id = params[:product_id] || params[:id]
    unless product_id.present?
      render json: { error: 'product_id query parameter required' }, status: :bad_request
      return
    end

    product = Product.find(product_id)

    points = (params[:points] || 10).to_i
    points = 10 if points <= 0
    # maximum 20 points
    points = [points, 20].min

    # leave blank since haven't implement price history model
    prices = []

    render json: { product_id: product.id, prices: prices }
  rescue StandardError => e
    render_error(e)
  end

  private

  # directly find the product by id for show, update, destroy, and price_history actions
  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(
      %i[name description price seller_id category_id location 
      contact status buyer_id image])
  end

  def render_error(error)
    logger.error("ProductsController error: "+ error.message)
    render json: { error: error.message }, status: :internal_server_error
  end
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
      images: product.images, # Assuming you have an images association or method to get image URLs
      created_at: product.created_at,
      updated_at: product.updated_at
    }
  end
