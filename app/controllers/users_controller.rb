class UsersController < ApplicationController
  before_action :set_user, only: %i[show update destroy]

  # GET /users
  def index
    users = User.all
    render json: users, status: :ok
  end

  # GET /users/sellers
  def sellers
    render json: User.sellers, status: :ok
  end

  # GET /users/:id
  def show
    render json: @user, status: :ok
  end

  # POST /users
  def create
    user = User.new(user_params)
    if user.save
      # generate a verification token (if not already generated) and send email
      user.generate_verification_token! if user.verification_token.blank?
      user.save if user.changed?
      UserMailer.verification_email(user).deliver_later
      render json: { user: user, message: 'verification_email_sent' }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /users/register
  # Alias to `create` for clarity when registering from the client
  def register
    create
  end

  # GET /users/verify?token=...
  def verify
    token = params[:token]
    if token.blank?
      render json: { error: 'token_missing' }, status: :bad_request
      return
    end

    user = User.find_by(verification_token: token)
    if user.nil?
      render json: { error: 'invalid_token' }, status: :not_found
      return
    end

    if user.verify!(token)
      render json: { message: 'verified' }, status: :ok
    else
      render json: { error: 'verification_failed' }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /users/:id
  def update
    if @user.update(user_params)
      render json: @user, status: :ok
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:email, :name, :password, :cuhk_id, :hostel, :is_seller, :seller_rating, :seller_review_count, :verified_at)
  end
end
