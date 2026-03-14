class UsersController < ApplicationController
  # GET /users
  def index
    render json: { status: 'ok', message: 'users#index' }
  end

  # GET /users/:id
  def show
    render json: { status: 'ok', message: 'users#show', id: params[:id] }
  end
end
