class ProductsController < ApplicationController
  # GET /products
  def index
    render json: { message: 'products#index' }
  end

  # GET /products/:id
  def show
    render json: { message: 'products#show', id: params[:id] }
  end

  # POST /products
  def create
    head :created
  end

  # PATCH/PUT /products/:id
  def update
    head :no_content
  end

  # DELETE /products/:id
  def destroy
    head :no_content
  end

  # GET /products/:id/price_history
  def price_history
    render json: { message: 'products#price_history', id: params[:id] }
  end
end
