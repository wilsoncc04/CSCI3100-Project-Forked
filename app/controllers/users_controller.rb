class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token  # API endpoints don't need CSRF protection
  before_action :set_user, only: [ :show, :update, :destroy ]
  before_action :authenticate_user!, only: [ :update, :destroy, :change_password, :interests ]
  before_action :authorize_user_owner!, only: [ :update, :destroy ]

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
      # temporary debugging
      begin
        mail = UserMailer.verification_email(user)
        Rails.logger.info "Attempting to deliver email to: #{user.email} | From: #{mail.from} | Delivery method: #{ActionMailer::Base.delivery_method}"

        mail.deliver_now!   # note the !  (this forces raise on failure)

        Rails.logger.info "Email delivery completed successfully"
      rescue => e
        Rails.logger.error "Email delivery FAILED: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        # Optionally still return success to user, or return error
      end
      # UserMailer.verification_email(user).deliver_now # app/mailers/user_mailer.rb, async (temporarily changing to deliver_now to test mailing capability)
      render json: { user: user.as_json(except: [ :password_digest,
      :verification_otp, :verification_sent_at, :verification_token ]), message: "verification_email_sent" }, status: :created
    else
      render_error(user.errors, status: :unprocessable_content)
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
      render_error("otp_missing", status: :bad_request)
      return
    end

    user = if email.present?
             User.find_by(email: email)
    else
             # fallback: find by otp
             User.find_by(verification_otp: otp)
    end

    if user.nil?
      render_error("invalid_otp_or_email", status: :not_found)
      return
    end

    if user.verify_otp!(otp)
    # 關鍵：驗證成功後自動登入，這樣跳轉到 Account 頁面才拿得到資料
    session[:user_id] = user.id

    render json: {
      message: "verified",
      user: format_user(user) # 把 user 資料傳回去，方便前端立刻 setUser
    }, status: :ok
    else
    render_error("verification_failed_or_expired", status: :unprocessable_content)
    end
end

  # POST /users/resend_verification
  def resend_verification
    # Accepts { email: "..." }
    email = params[:email].to_s.downcase
    if email.blank?
      render json: { message: "verification_email_sent_if_needed" }, status: :ok
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
    render json: { message: "verification_email_sent_if_needed" }, status: :ok
  end

 # ====== register section end ======

 # PATCH/PUT /users/:id
 def update
  # 1. 處理圖片上傳 (你原本的邏輯)
  if params[:profile_picture].present?
    @user.profile_picture.purge if @user.profile_picture.attached?
    @user.profile_picture.attach(params[:profile_picture])
  end

  # 2. 更新其他欄位 (College, Hostel 等)
  if params[:user].present?
    # user_params 已經包含了 :college 和 :hostel
    unless @user.update(user_params)
      render_error(@user.errors, status: :unprocessable_content)
      return
    end
  end

    render json: format_user(@user), status: :ok
  end

  def change_password
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:current_password])
      if user.update(password: params[:new_password])
        render json: { message: "password_changed" }, status: :ok
      else
        render_error(user.errors, status: :unprocessable_content)
      end
    else
      render_error("invalid_credentials", status: :unauthorized)
    end
  end

  # DELETE /users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  # GET /users/interests
  def interests
  # 這裡不需要 set_user，因為我們直接用 current_user
  @interests = current_user.interests.includes(:product)

  render json: @interests.map { |interest|
    product = interest.product
    next if product.nil? # 防呆：萬一產品被刪了
    {
      id: product.id,
      name: product.name,
      price: product.price,
      status: product.status,
      images: product.image_urls
    }
  }.compact, status: :ok
end

  private

  def user_params
  params.require(:user).permit(
    :name, :email, :password, :cuhk_id, :hostel, :college, :bio, :profile_picture
  )
end

  def format_user(user)
  user.as_json(except: [ :password_digest, :verification_otp ]).merge(
    # 增加圖片網址回傳
    profile_picture_url: user.profile_picture.attached? ? url_for(user.profile_picture) : nil
  )
  end

  def set_user
    id_param = params[:id].to_s.strip
    # Try to find by database ID first, then by CUHK ID
    @user = if id_param.match?(/^\d+$/) && id_param.to_i < 1000000
              # Looks like a database ID
              User.find_by!(id: id_param.to_i)
    else
              # Treat as CUHK ID
              User.find_by!(cuhk_id: id_param)
    end
  rescue ActiveRecord::RecordNotFound
    render_error("User not found", status: :not_found)
  end

  def authorize_user_owner!
    unless @user.id == current_user.id
      render_unauthorized
    end
  end
end
