# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  def subscribed
    if params[:chat_id].present?
      stream_from "chat_#{params[:chat_id]}"
    else
      reject
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
