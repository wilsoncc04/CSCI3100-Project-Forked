# message => chat => output
# reference: https://medium.com/@reinteractivehq/adding-an-ai-chat-to-your-ruby-on-rails-application-58f5c943182b
class ChatsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chat, only: [:show]
  before_action :authorize_chat_participant!, only: [:show]

  # GET /chats
  # List all chats for the current user (as seller or buyer)
  def index
    # Get chats where user is seller or buyer
    seller_chats = Chat.where(seller_id: current_user.id)
    buyer_chats = Chat.where(interested_id: current_user.id)
    chats = (seller_chats + buyer_chats).uniq.sort_by { |chat| chat.updated_at }.reverse

    # format chat: formatting the chat data, like AI chatbot
    render json: chats.map { |chat| format_chat(chat) }
  end

  # GET /chats/:id
  # Get a specific chat with all messages
  def show
    chat_data = format_chat(@chat)
    chat_data[:messages] = @chat.messages.map { |msg| format_message(msg) }

    render json: chat_data
  end

  # POST /chats
  # Create a new chat between buyer and seller
  def create
    product = Product.find_by(id: params[:product_id])
    unless product
      render json: { error: 'Product not found' }, status: :not_found
      return
    end

    seller = product.seller
    buyer = current_user

    # Prevent seller from chatting with themselves
    if seller.id == buyer.id
      render json: { error: 'Cannot chat with yourself' }, status: :unprocessable_content
      return
    end

    # Check if chat already exists
    existing_chat = Chat.find_by(
      item_id: product.id,
      seller_id: seller.id,
      interested_id: buyer.id
    )

    if existing_chat
      render json: format_chat(existing_chat), status: :ok
      return
    end

    # Create new chat
    chat = Chat.new(
      item_id: product.id,
      seller_id: seller.id,
      interested_id: buyer.id
    )

    if chat.save
      render json: format_chat(chat), status: :created
    else
      render json: { errors: chat.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_chat
    @chat = Chat.find_by(id: params[:id])
    unless @chat
      render json: { error: 'Chat not found' }, status: :not_found
    end
  end

  def authorize_chat_participant!
    unless @chat.seller_id == current_user.id || @chat.interested_id == current_user.id
      render_unauthorized
    end
  end

  # define the format of chat data (Like AI chatbot)
  def format_chat(chat)
    {
      id: chat.id,
      product: {
        id: chat.product.id,
        name: chat.product.name,
        price: chat.product.price,
        image: chat.product.image
      },
      seller: format_user(chat.seller),
      buyer: format_user(chat.interested_user),
      last_message: chat.messages.last&.message,
      last_message_at: chat.messages.last&.created_at,
      created_at: chat.created_at,
      updated_at: chat.updated_at
    }
  end

  def format_message(message)
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
      is_admin: user.is_admin,
      seller_rating: user.seller_rating
    }
  end
end
