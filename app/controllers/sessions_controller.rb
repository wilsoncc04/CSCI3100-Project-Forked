# Login and logout actions for user sessions
class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token  # API endpoints don't need CSRF protection

  # GET /sessions (check login status)
  def show
    if current_user
      render json: format_user(current_user), status: :ok
    else
      render json: { error: 'not_logged_in' }, status: :unauthorized
    end
  end

  # POST /sessions (login)
  def create
    login_params = params[:session] || params
    user = User.find_by(email: login_params[:email])
    if user && user.authenticate(login_params[:password])
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
    render json: { message: 'logged_out' }, status: :ok
  end
  def format_user(user)
    user.as_json(only: [:id, :name, :email, :cuhk_id, :hostel, :college, :is_admin, :verified_at])
  end
end
