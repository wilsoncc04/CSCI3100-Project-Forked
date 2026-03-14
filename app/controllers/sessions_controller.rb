class SessionsController < ApplicationController
  # POST /sessions (login)
  def create
    render json: { message: 'sessions#create' }, status: :created
  end

  # DELETE /sessions/:id (logout)
  def destroy
    head :no_content
  end
end
