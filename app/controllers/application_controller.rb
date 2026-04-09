class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  include ActionController::Cookies # if using cookies for authentication

  private

  def current_user
    # find the user name in cookies or session
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def current_user_admin?
    current_user&.is_admin == true
  end

  def is_json_request?
    request.format.json? || request.content_type.to_s.include?('application/json')
  end

  def authenticate_user!
    return if current_user
    if is_json_request?
      render_error('unauthenticated', status: :unauthorized)
    else
      redirect_to root_path, alert: 'Please log in'
    end
  end

  def authorize_user!(user)
    # Check if current user is the same as the user being modified
    # or if current user is an admin
    return if current_user&.id == user.id
    render_unauthorized
  end

  def render_unauthorized
    if is_json_request?
      render_error('unauthorized', status: :forbidden)
    else
      redirect_to root_path, alert: 'You do not have permission to access this resource'
    end
  end

  def require_admin!
    # Placeholder for admin authorization logic
    # For now, we'll just allow all requests to pass through
  end

  def render_error(error, status: :bad_request)
    if error.is_a?(StandardError)
      logger.error("#{self.class.name} error: #{error.class} - #{error.message}")
      logger.error(error.backtrace.first(5).join("\n")) if error.backtrace
      message = error.message.presence || 'internal_server_error'
      render json: { error: message, errors: [message] }, status: :internal_server_error
    elsif error.respond_to?(:full_messages)
      messages = error.full_messages
      render json: { error: messages.first, errors: messages }, status: status
    elsif error.is_a?(Array)
      messages = error.map(&:to_s)
      render json: { error: messages.first, errors: messages }, status: status
    else
      message = error.to_s
      render json: { error: message, errors: [message] }, status: status
    end
  end

  def format_user(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      cuhk_id: user.cuhk_id,
      college: user.college,
      hostel: user.hostel,
      is_admin: user.is_admin,
      seller_rating: user.seller_rating,
      seller_review_count: user.seller_review_count,
      profile_picture_url: user.profile_picture&.attached? ? url_for(user.profile_picture) : nil
    }
  end
end
