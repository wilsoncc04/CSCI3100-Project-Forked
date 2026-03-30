# Login and logout actions for user sessions
class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token  # API endpoints don't need CSRF protection
  # POST /sessions (login)
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      if user.verified_at.present?   #ensure the DB record is correctly updated after email verification
        # establish server-side session
        session[:user_id] = user.id
        render json: { message: 'logged_in', user: format_user(user) }, status: :created
      else
        render_error('email_not_verified', status: :forbidden)
      end
    else
      # invalid password or email
      render_error('invalid_credentials', status: :unauthorized)
    end
  end

  # DELETE /sessions/:id (logout)
  def destroy
    reset_session
    head :no_content
  end
end
