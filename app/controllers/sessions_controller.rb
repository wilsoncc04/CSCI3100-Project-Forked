class SessionsController < ApplicationController
  # POST /sessions (login)
  def create
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      if user.verified_at.present?
        # Replace this with real session/token issuance as needed
        render json: { message: 'logged_in', user: user }, status: :created
      else
        render json: { error: 'email_not_verified' }, status: :forbidden
      end
    else
      render json: { error: 'invalid_credentials' }, status: :unauthorized
    end
  end

  # DELETE /sessions/:id (logout)
  def destroy
    head :no_content
  end
end
