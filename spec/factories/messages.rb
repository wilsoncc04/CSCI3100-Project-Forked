FactoryBot.define do
  factory :message do
    association :chat
    association :sender, factory: :user
    message { 'Hello, this is a test message' }
    
    sender_id { sender.id }
    chat_id { chat.id }
  end
end
