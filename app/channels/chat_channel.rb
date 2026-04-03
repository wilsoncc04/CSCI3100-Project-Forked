# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  def subscribed
    # 確保前端有傳 chat_id
    if params[:chat_id].present?
      stream_from "chat_#{params[:chat_id]}"
    else
      reject
    end
  end

  def unsubscribed
    # 這裡可以放斷開連接時的邏輯
  end
end
