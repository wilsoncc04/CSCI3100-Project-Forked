class Message < ApplicationRecord
  belongs_to :chat, foreign_key: 'chat_id'
  belongs_to :sender, foreign_key: 'sender_id', class_name: 'User'
  
  validates :chat_id, :sender_id, :message, presence: true
  
  after_create :broadcast_message
  
  private
  
  def broadcast_message
    # ActionCable broadcast - uncomment when ActionCable is set up
    # ActionCable.server.broadcast("chat_#{chat_id}", { message: self })
  end
end
