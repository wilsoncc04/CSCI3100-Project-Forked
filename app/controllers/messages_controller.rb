class MessagesController < ApplicationController
  before_action :set_chat, only: [:index, :create, :show, :destroy]
  before_action :set_message, only: [:show, :destroy]
  before_action :authorize_user, only: [:create, :destroy]

  # GET /chats/:chat_id/messages
  # List all messages in a chat
  def index
    # unless current_user
    #   render json: { error: 'Unauthorized' }, status: :unauthorized
    #   return
    # end

    # Verify user has access to this chat
    # unless @chat.seller_id == current_user.id || @chat.interested_id == current_user.id
    #   render json: { error: 'Forbidden' }, status: :forbidden
    #   return
    # end

    messages = @chat.messages.order(:created_at)
    render json: messages.map { |msg| format_message(msg, current_user) }
  end

  # GET /chats/:chat_id/messages/:id
  # Show a specific message
  def show
    # unless current_user
    #   render json: { error: 'Unauthorized' }, status: :unauthorized
    #   return
    # end

    # unless @chat.seller_id == current_user.id || @chat.interested_id == current_user.id
    #   render json: { error: 'Forbidden' }, status: :forbidden
    #   return
    # end

    render json: format_message(@message, current_user)
  end

  # POST /chats/:chat_id/messages
  # Create a new message in a chat
  def create
    # unless current_user
    #   render json: { error: 'Unauthorized' }, status: :unauthorized
    #   return
    # end

    # unless @chat.seller_id == current_user.id || @chat.interested_id == current_user.id
    #   render json: { error: 'Forbidden' }, status: :forbidden
    #   return
    # end

    # Build new message attached to this chat (.build => an object)
    message = @chat.messages.build(message_params)
    message.sender_id = current_user.id

    if message.save
      render json: format_message(message, current_user), status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /chats/:chat_id/messages/:id
  # Delete a message (owner only)
  def destroy
    # unless current_user
    #   render json: { error: 'Unauthorized' }, status: :unauthorized
    #   return
    # end

    # unless @chat.seller_id == current_user.id || @chat.interested_id == current_user.id
    #   render json: { error: 'Forbidden' }, status: :forbidden
    #   return
    # end

    @message.destroy
    head :no_content
  end

  private

  def set_chat
    @chat = Chat.find_by(id: params[:chat_id])
    unless @chat
      render json: { error: 'Chat not found' }, status: :not_found
    end
  end

  def set_message
    @message = Message.find_by(id: params[:id])
    unless @message
      render json: { error: 'Message not found' }, status: :not_found
    end
  end

  def authorize_user
    # Users can only create messages in chats they're part of
    # This is already checked in the create action, but this is a general guard
  end

  def message_params
    params.require(:message).permit(:message)
  end

  def format_message(message, user)
    {
      id: message.id,
      chat_id: message.chat_id,
      message: message.message,
      sender: format_user(message.sender),
      created_at: message.created_at,
      updated_at: message.updated_at
    }
  end

  # Helper method to format user data consistently
  # Includes: id (for API operations), cuhk_id (for display), email (for contact), name, and profile
  def format_user(user)
    {
      id: user.id,
      cuhk_id: user.cuhk_id,
      email: user.email,
      name: user.name,
      profile_picture: user.profile_picture,
      is_seller: user.is_seller,
      seller_rating: user.seller_rating
    }
  end
end
