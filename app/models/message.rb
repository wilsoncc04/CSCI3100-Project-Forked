class Message < ApplicationRecord
  belongs_to :chat, foreign_key: 'chat_id'
  belongs_to :sender, class_name: 'User', foreign_key: 'sender_id'
  
  validates :chat_id, :sender_id, :message, presence: true
  
  after_create_commit :broadcast_message
  
  private
  
  def broadcast_message
    ActionCable.server.broadcast("chat_#{chat_id}", {
      id: self.id,
      chat_id: self.chat_id,
      message: self.message,
      created_at: self.created_at,
      sender: {
        id: self.sender.id,
        name: self.sender.name
      }
    })
  end
end
