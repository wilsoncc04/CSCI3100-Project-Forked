class ChatsController < ApplicationController
  # GET /chats
  def index
    render json: { message: 'chats#index' }
  end

  # GET /chats/:id
  def show
    render json: { message: 'chats#show', id: params[:id] }
  end

  # POST /chats
  def create
    render json: { message: 'chats#create' }, status: :created
  end
end
