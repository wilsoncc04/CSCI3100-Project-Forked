class UsersController < ApplicationController
  before_action :set_user, only: [:show, :update, :destroy]
  before_action :authenticate_user!, only: [:update, :destroy, :change_password]
  before_action :authorize_user_owner!, only: [:update, :destroy]

  # GET /users
  # should be used for admin dashboard, not public API
  def index
    users = User.all
    render json: users.map { |u| format_user(u) }, status: :ok
  end

  # GET /users/admins
  # should be used for admin dashboard, not public API
  def admins
    render json: User.admins.map { |u| format_user(u) }, status: :ok
  end

  # GET /users/:id
  # should be used for admin dashboard, not public API
  def show
    render json: format_user(@user), status: :ok
  end

  # ====== register section start ======

  # POST /users
  def create
    # require: email, name, password, cuhk_id, hostel, is_admin
    user = User.new(user_params)
    if user.save
      # generate a numeric OTP (if not already generated, prevent model bugs) and send email
      user.generate_verification_otp! if user.verification_otp.blank?
      user.save if user.changed?
      UserMailer.verification_email(user).deliver_later # app/mailers/user_mailer.rb, async
      render json: { user: user.as_json(except: [:password_digest, 
      :verification_otp, :verification_sent_at, :verification_token]), message: 'verification_email_sent' }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end

  # POST /users/register
  # specify the route name
  def register
    create
  end

  # POST /users/verify?otp=...&email=... (or POST with { email, otp })
  def verify
    # Support OTP verification: accept email+otp
    otp = params[:otp] 
    email = params[:email]

    if otp.blank?
      render json: { error: 'otp_missing' }, status: :bad_request
      return
    end

    user = if email.present?
             User.find_by(email: email)
           else
             # fallback: find by otp
             User.find_by(verification_otp: otp)
           end

    if user.nil?
      render json: { error: 'invalid_otp_or_email' }, status: :not_found
      return
    end

    if user.verify_otp!(otp)
      render json: { message: 'verified' }, status: :ok
    else
      render json: { error: 'verification_failed_or_expired' }, status: :unprocessable_content
    end
  end

  # POST /users/resend_verification
  def resend_verification
    # Accepts { email: "..." }
    email = params[:email].to_s.downcase
    if email.blank?
      render json: { message: 'verification_email_sent_if_needed' }, status: :ok
      return
    end

    user = User.find_by(email: email)
    if user && user.verified_at.nil?
      # TODO: throttle resends (e.g., rack-attack) to prevent abuse => AI suggestion
      user.generate_verification_otp!
      user.save
      UserMailer.verification_email(user).deliver_later
    end

    # Generic response to avoid account enumeration
    render json: { message: 'verification_email_sent_if_needed' }, status: :ok
  end

  # ====== register section end ======

  # PATCH/PUT /users/:id
  def update
    # Handle profile picture upload
    if params[:profile_picture].present?
      @user.profile_picture.purge if @user.profile_picture.attached?
      @user.profile_picture.attach(params[:profile_picture]) if params[:profile_picture].is_a?(ActionDispatch::Http::UploadedFile)
    end

    # Update other user attributes if provided
    if params[:user].present?
      if !@user.update(user_params)
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_content
        return
      end
    end

    render json: format_user(@user), status: :ok
  end

  def change_password
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:current_password])
      if user.update(password: params[:new_password])
        render json: { message: 'password_changed' }, status: :ok
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_content
      end
    else
      render json: { error: 'invalid_credentials' }, status: :unauthorized
    end
  end

  # DELETE /users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(
      %i[name email password cuhk_id hostel is_admin college profile_picture])
  end

  def set_user
    cuhk = params[:id].to_s.strip
    @user = User.find_by!(cuhk_id: cuhk)
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end

  def authorize_user_owner!
    unless @user.id == current_user.id
      render_unauthorized
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
