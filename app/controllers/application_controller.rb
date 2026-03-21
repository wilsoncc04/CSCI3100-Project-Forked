class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  include ActionController::Cookies # if using cookies for authentication

  private

  def current_user
    # find the user name in cookies or session
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def authenticate_user!
    return if current_user
    if request.format.json?
      render json: { error: 'unauthenticated' }, status: :unauthorized
      else
    redirect_to root_path, alert: 'Please log in'
  end
  end

  def require_admin!
    # Placeholder for admin authorization logic
    # For now, we'll just allow all requests to pass through
  end
end
