class ProductsController < ApplicationController
  # attributes to include when rendering product JSON, %i mean ":" for all items
  PRODUCT_JSON_ONLY = %i[id name description price created_at updated_at].freeze

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
    if product.save
      render json: product.as_json(only: PRODUCT_JSON_ONLY), status: :created
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  rescue StandardError => e
    render_error(e)
  end

  # PATCH/PUT /products/:id
  # update product details
  def update
    if @product.update(product_params)
      render json: @product.as_json(only: PRODUCT_JSON_ONLY)
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
    params.require(:product).permit(:name, :description, :price, :seller_id)
  end

  def render_error(error)
    logger.error("ProductsController error: "+ error.message)
    render json: { error: error.message }, status: :internal_server_error
  end
end
