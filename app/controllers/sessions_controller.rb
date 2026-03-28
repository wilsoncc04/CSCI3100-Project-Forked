# Login and logout actions for user sessions
class SessionsController < ApplicationController
  # POST /sessions (login)
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      if user.verified_at.present?   #ensure the DB record is correctly updated after email verification
        # establish server-side session
        session[:user_id] = user.id
        render json: { message: 'logged_in', user: format_user(user) }, status: :created
      else
        render json: { error: 'email_not_verified' }, status: :forbidden
      end
    else
      # invalid password or email
      render json: { error: 'invalid_credentials' }, status: :unauthorized
    end
  end

  # DELETE /sessions/:id (logout)
  def destroy
    reset_session
    head :no_content
  end

  private

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
