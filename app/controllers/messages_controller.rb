class MessagesController < ApplicationController
  # GET /messages
  def index
    render json: { message: 'messages#index' }
  end

  # GET /messages/:id
  def show
    render json: { message: 'messages#show', id: params[:id] }
  end

  # POST /messages
  def create
    render json: { message: 'messages#create' }, status: :created
  end

  # DELETE /messages/:id
  def destroy
    head :no_content
  end
end
