require 'rails_helper'

RSpec.describe 'Messages API', type: :request do
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:product) { create(:product, seller_id: seller.id, category_id: category.id) }
  let(:chat) { create(:chat, seller_id: seller.id, interested_id: buyer.id,
                             item_id: product.id, product: product) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  describe 'GET /chats/:chat_id/messages (index)' do
    context 'as buyer (chat participant)' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      context 'with no messages' do
        it 'returns an empty array' do
          get chat_messages_path(chat.id), headers: json_headers
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq([])
        end
      end

      context 'with messages' do
        before do
          create_list(:message, 3, chat_id: chat.id, sender: buyer)
        end

        it 'returns all messages in the chat' do
          get chat_messages_path(chat.id), headers: json_headers
          expect(response).to have_http_status(:ok)
          messages_data = JSON.parse(response.body)
          expect(messages_data.length).to eq(3)
        end

        it 'returns messages with correct attributes' do
          get chat_messages_path(chat.id), headers: json_headers
          messages_data = JSON.parse(response.body)
          message_data = messages_data.first

          expect(message_data).to include(
            'id', 'chat_id', 'message', 'sender', 'created_at', 'updated_at'
          )
        end

        it 'returns messages in chronological order' do
          # Delete pre-existing messages from this chat to ensure consistent test
          chat.messages.destroy_all

          msg1 = create(:message, chat_id: chat.id, sender: buyer,
                                 created_at: 2.hours.ago, message: 'First message')
          msg2 = create(:message, chat_id: chat.id, sender: seller,
                                 created_at: 1.hour.ago, message: 'Second message')
          msg3 = create(:message, chat_id: chat.id, sender: buyer,
                                 created_at: Time.current, message: 'Third message')

          get chat_messages_path(chat.id), headers: json_headers
          messages_data = JSON.parse(response.body)

          expect(messages_data.length).to eq(3)
          expect(messages_data[0]['message']).to eq('First message')
          expect(messages_data[1]['message']).to eq('Second message')
          expect(messages_data[2]['message']).to eq('Third message')
        end
      end
    end

    context 'as non-participant' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(another_user)
      end

      it 'returns forbidden error' do
        get chat_messages_path(chat.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'GET /chats/:chat_id/messages/:id (show)' do
    let(:message) { create(:message, chat_id: chat.id, sender: buyer) }

    context 'as buyer (chat participant)' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'returns message with correct attributes' do
        get chat_message_path(chat.id, message.id), headers: json_headers
        expect(response).to have_http_status(:ok)
        message_data = JSON.parse(response.body)

        expect(message_data).to include(
          'id', 'chat_id', 'message', 'sender', 'created_at', 'updated_at'
        )
        expect(message_data['id']).to eq(message.id)
      end
    end

    context 'as non-participant' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(another_user)
      end

      it 'returns forbidden error' do
        get chat_message_path(chat.id, message.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'POST /chats/:chat_id/messages (create)' do
    let(:valid_params) { { message: { message: 'Hello!' } } }

    context 'as buyer' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'creates a message successfully' do
        expect {
          post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        }.to change(Message, :count).by(1)
      end

      it 'returns created status' do
        post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        expect(response).to have_http_status(:created)
      end

      it 'sets the current user as the sender' do
        post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        message_data = JSON.parse(response.body)
        expect(message_data['sender']['id']).to eq(buyer.id)
      end
    end

    context 'as seller' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(seller)
      end

      it 'allows seller to send message' do
        expect {
          post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        }.to change(Message, :count).by(1)
      end

      it 'sets seller as the sender' do
        post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        message_data = JSON.parse(response.body)
        expect(message_data['sender']['id']).to eq(seller.id)
      end
    end

    context 'with empty message' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'returns unprocessable entity error' do
        post chat_messages_path(chat.id),
             params: { message: { message: '' } },
             headers: json_headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when message parameter is missing' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'returns bad request error' do
        post chat_messages_path(chat.id), params: {}, headers: json_headers
        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'when chat does not exist' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'returns not found error' do
        post chat_messages_path(9999), params: valid_params, headers: json_headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'as non-participant' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(another_user)
      end

      it 'returns forbidden error' do
        post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        expect(response).to have_http_status(:forbidden)
      end

      it 'does not create a message' do
        expect {
          post chat_messages_path(chat.id), params: valid_params, headers: json_headers
        }.not_to change(Message, :count)
      end
    end

    context 'with special content' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'accepts special characters' do
        special_message = 'Price: $50! Really?! #trending'
        post chat_messages_path(chat.id),
             params: { message: { message: special_message } },
             headers: json_headers
        message_data = JSON.parse(response.body)
        expect(message_data['message']).to eq(special_message)
      end

      it 'accepts unicode characters' do
        unicode_message = 'Hello 世界! Привет 🌍'
        post chat_messages_path(chat.id),
             params: { message: { message: unicode_message } },
             headers: json_headers
        message_data = JSON.parse(response.body)
        expect(message_data['message']).to eq(unicode_message)
      end

      it 'accepts long messages' do
        long_message = 'A' * 500
        post chat_messages_path(chat.id),
             params: { message: { message: long_message } },
             headers: json_headers
        expect(response).to have_http_status(:created)
      end
    end
  end

  describe 'DELETE /chats/:chat_id/messages/:id (destroy)' do
    let(:message) { create(:message, chat_id: chat.id, sender: buyer) }

    context 'as buyer' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
      end

      it 'returns no content status' do
        delete chat_message_path(chat.id, message.id), headers: json_headers
        expect(response).to have_http_status(:no_content)
      end

      it 'does not actually delete the message' do
        original_id = message.id
        delete chat_message_path(chat.id, message.id), headers: json_headers
        expect(response).to have_http_status(:no_content)

        # Check the message still exists in database
        expect(Message.find_by(id: original_id)).to be_present
      end
    end

    context 'as non-participant' do
      before do
        allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(MessagesController).to receive(:current_user).and_return(another_user)
      end

      it 'returns forbidden error' do
        delete chat_message_path(chat.id, message.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'Message formatting' do
    let(:message) { create(:message, chat_id: chat.id, sender: buyer) }

    before do
      allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
      allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
    end

    it 'includes all required fields' do
      get chat_message_path(chat.id, message.id), headers: json_headers
      message_data = JSON.parse(response.body)

      expect(message_data).to include('id', 'chat_id', 'message', 'sender', 'created_at', 'updated_at')
    end

    it 'does not expose sensitive information' do
      get chat_message_path(chat.id, message.id), headers: json_headers
      message_data = JSON.parse(response.body)
      sender_data = message_data['sender']

      expect(sender_data).not_to include('password_digest', 'verification_otp')
    end

    it 'includes contact information' do
      get chat_message_path(chat.id, message.id), headers: json_headers
      message_data = JSON.parse(response.body)
      sender_data = message_data['sender']

      expect(sender_data).to include('email', 'name', 'profile_picture_url', 'cuhk_id')
    end
  end

  describe 'Message ordering' do
    before do
      allow_any_instance_of(MessagesController).to receive(:authenticate_user!).and_return(true)
      allow_any_instance_of(MessagesController).to receive(:current_user).and_return(buyer)
    end

    it 'maintains conversation order' do
      msg1 = create(:message, chat_id: chat.id, sender: buyer, message: 'First')
      msg2 = create(:message, chat_id: chat.id, sender: seller, message: 'Second')
      msg3 = create(:message, chat_id: chat.id, sender: buyer, message: 'Third')

      get chat_messages_path(chat.id), headers: json_headers
      messages_data = JSON.parse(response.body)

      expect(messages_data.map { |m| m['message'] }).to eq([ 'First', 'Second', 'Third' ])
    end

    it 'shows different senders correctly' do
      create(:message, chat_id: chat.id, sender: buyer)
      create(:message, chat_id: chat.id, sender: seller)
      create(:message, chat_id: chat.id, sender: buyer)

      get chat_messages_path(chat.id), headers: json_headers
      messages_data = JSON.parse(response.body)

      expect(messages_data[0]['sender']['id']).to eq(buyer.id)
      expect(messages_data[1]['sender']['id']).to eq(seller.id)
      expect(messages_data[2]['sender']['id']).to eq(buyer.id)
    end
  end
end
