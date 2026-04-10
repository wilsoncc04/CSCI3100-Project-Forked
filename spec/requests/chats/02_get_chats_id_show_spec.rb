require 'rails_helper'

RSpec.describe 'Chats API', type: :request do
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:product) { create(:product, seller_id: seller.id, category_id: category.id) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  describe 'GET /chats/:id (show)' do
    let(:chat) { create(:chat, seller_id: seller.id, interested_id: buyer.id,
                               item_id: product.id) }

    context 'with authorized access as buyer (chat participant)' do
      before do
        allow_any_instance_of(ChatsController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(buyer)
      end

      context 'when chat exists' do
        it 'returns chat with all messages' do
          create_list(:message, 3, chat_id: chat.id, sender: buyer)

          get chat_path(chat.id), headers: json_headers
          expect(response).to have_http_status(:ok)
          chat_data = JSON.parse(response.body)

          expect(chat_data).to include('id', 'messages')
          expect(chat_data['messages']).to be_an(Array)
          expect(chat_data['messages'].length).to eq(3)
        end

        it 'returns messages with correct attributes' do
          message = create(:message, chat_id: chat.id, sender: buyer)

          get chat_path(chat.id), headers: json_headers
          chat_data = JSON.parse(response.body)
          message_data = chat_data['messages'].first

          expect(message_data).to include(
            'id', 'chat_id', 'message', 'sender', 'created_at', 'updated_at'
          )
          expect(message_data['message']).to eq(message.message)
        end

        it 'returns messages in chronological order' do
          message1 = create(:message, chat_id: chat.id, sender: buyer,
                                     created_at: 1.hour.ago)
          message2 = create(:message, chat_id: chat.id, sender: seller,
                                     created_at: Time.current)

          get chat_path(chat.id), headers: json_headers
          chat_data = JSON.parse(response.body)
          messages = chat_data['messages']

          expect(messages.first['id']).to eq(message1.id)
          expect(messages.last['id']).to eq(message2.id)
        end

        it 'includes chat metadata with messages' do
          get chat_path(chat.id), headers: json_headers
          chat_data = JSON.parse(response.body)

          expect(chat_data).to include(
            'product', 'seller', 'buyer', 'last_message', 'last_message_at'
          )
        end
      end

      context 'when chat does not exist' do
        it 'returns not found error' do
          get chat_path(9999), headers: json_headers
          expect(response).to have_http_status(:not_found)
          response_data = JSON.parse(response.body)
          expect(response_data['error']).to eq('Chat not found')
        end
      end
    end

    context 'with unauthorized access (not a participant)' do
      before do
        allow_any_instance_of(ChatsController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(another_user)
      end

      it 'returns unauthorized error' do
        get chat_path(chat.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when user is seller' do
      before do
        allow_any_instance_of(ChatsController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(seller)
      end

      it 'allows seller to access their chat' do
        get chat_path(chat.id), headers: json_headers
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when user is buyer' do
      before do
        allow_any_instance_of(ChatsController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(buyer)
      end

      it 'allows buyer to access their chat' do
        get chat_path(chat.id), headers: json_headers
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
