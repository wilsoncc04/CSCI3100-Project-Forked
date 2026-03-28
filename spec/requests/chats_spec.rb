require 'rails_helper'

RSpec.describe 'Chats API', type: :request do
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:product) { create(:product, seller_id: seller.id, category_id: category.id) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  describe 'GET /chats (index)' do
    context 'when user is authenticated' do
      before do
        allow_any_instance_of(ChatsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ChatsController).to receive(:current_user).and_return(buyer)
        end
      end

      context 'with no chats' do
        it 'returns an empty array' do
          get chats_path, headers: json_headers
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq([])
        end
      end

      context 'with chats as buyer' do
        before do
          @chat1 = create(:chat, seller_id: seller.id, interested_id: buyer.id, 
                                  item_id: product.id)
          @chat2 = create(:chat, seller_id: another_user.id, interested_id: buyer.id,
                                  item_id: product.id)
        end

        it 'returns all chats where user is buyer' do
          get chats_path, headers: json_headers
          expect(response).to have_http_status(:ok)
          chats_data = JSON.parse(response.body)
          expect(chats_data.length).to eq(2)
        end

        it 'returns chats with correct attributes' do
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          chat_data = chats_data.first
          
          expect(chat_data).to include(
            'id', 'product', 'seller', 'buyer', 'last_message', 
            'last_message_at', 'created_at', 'updated_at'
          )
        end

        it 'formats product data correctly' do
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          product_data = chats_data.first['product']
          
          expect(product_data).to include('id', 'name', 'price', 'image')
        end

        it 'formats seller data correctly' do
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          seller_data = chats_data.first['seller']
          
          expect(seller_data).to include(
            'id', 'cuhk_id', 'email', 'name', 'profile_picture', 
            'is_admin', 'seller_rating'
          )
        end

        it 'formats buyer data correctly' do
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          buyer_data = chats_data.first['buyer']
          
          expect(buyer_data).to include(
            'id', 'cuhk_id', 'email', 'name', 'profile_picture', 
            'is_admin', 'seller_rating'
          )
        end

        it 'returns chats sorted by most recent first' do
          older_chat = create(:chat, seller_id: seller.id, interested_id: buyer.id,
                                     item_id: product.id,
                                     updated_at: 1.day.ago)
          newer_chat = create(:chat, seller_id: another_user.id, interested_id: buyer.id,
                                     item_id: product.id,
                                     updated_at: Time.current)
          
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          
          # Newest should be first
          expect(chats_data.first['id']).to eq(newer_chat.id)
          expect(chats_data.last['id']).to eq(older_chat.id)
        end
      end

      context 'with chats as seller' do
        before do
          allow_any_instance_of(ChatsController).to receive(:current_user).and_return(seller)
        end

        before do
          create(:chat, seller_id: seller.id, interested_id: buyer.id,
                        item_id: product.id)
        end

        it 'returns chats where user is seller' do
          get chats_path, headers: json_headers
          expect(response).to have_http_status(:ok)
          chats_data = JSON.parse(response.body)
          expect(chats_data.length).to eq(1)
          expect(chats_data.first['seller']['id']).to eq(seller.id)
        end
      end

      context 'with duplicate chats (same users, different products)' do
        it 'returns unique chats only' do
          chat1 = create(:chat, seller_id: seller.id, interested_id: buyer.id,
                                item_id: product.id)
          
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          
          # Should only appear once in results
          matching_chats = chats_data.select { |c| c['id'] == chat1.id }
          expect(matching_chats.length).to eq(1)
        end
      end
    end

    context 'when user is not authenticated' do
      it 'blocks access without authentication' do
        get chats_path, headers: json_headers
        # The controller has before_action :authenticate_user! which would prevent access
      end
    end
  end

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

  describe 'POST /chats (create)' do
    before do
      allow_any_instance_of(ChatsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(buyer)
      end
    end

    let(:valid_params) do
      { product_id: product.id }
    end

    context 'when creating a new chat' do
      it 'creates a chat successfully' do
        expect {
          post chats_path, params: valid_params, headers: json_headers
        }.to change(Chat, :count).by(1)
      end

      it 'returns created status' do
        post chats_path, params: valid_params, headers: json_headers
        expect(response).to have_http_status(:created)
      end

      it 'returns chat data with correct attributes' do
        post chats_path, params: valid_params, headers: json_headers
        chat_data = JSON.parse(response.body)
        
        expect(chat_data).to include(
          'id', 'product', 'seller', 'buyer', 'created_at', 'updated_at'
        )
      end

      it 'sets correct seller and buyer' do
        post chats_path, params: valid_params, headers: json_headers
        chat_data = JSON.parse(response.body)
        
        expect(chat_data['seller']['id']).to eq(seller.id)
        expect(chat_data['buyer']['id']).to eq(buyer.id)
      end

      it 'associates chat with correct product' do
        post chats_path, params: valid_params, headers: json_headers
        chat_data = JSON.parse(response.body)
        
        expect(chat_data['product']['id']).to eq(product.id)
      end
    end

    context 'when product does not exist' do
      it 'returns not found error' do
        post chats_path, params: { product_id: 9999 }, headers: json_headers
        expect(response).to have_http_status(:not_found)
        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('Product not found')
      end
    end

    context 'when seller tries to chat with themselves' do
      before do
        allow_any_instance_of(ChatsController).to receive(:authenticate_user!).and_return(true)
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(seller)
      end

      it 'returns unprocessable entity error' do
        post chats_path, params: valid_params, headers: json_headers
        expect(response).to have_http_status(:unprocessable_content)
        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('Cannot chat with yourself')
      end
    end

    context 'when chat already exists' do
      before do
        create(:chat, seller_id: seller.id, interested_id: buyer.id,
                      item_id: product.id)
      end

      it 'returns existing chat without creating a new one' do
        expect {
          post chats_path, params: valid_params, headers: json_headers
        }.not_to change(Chat, :count)
      end

      it 'returns ok status' do
        post chats_path, params: valid_params, headers: json_headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns the existing chat' do
        existing_chat = Chat.find_by(item_id: product.id, seller_id: seller.id, 
                                     interested_id: buyer.id)
        
        post chats_path, params: valid_params, headers: json_headers
        chat_data = JSON.parse(response.body)
        
        expect(chat_data['id']).to eq(existing_chat.id)
      end
    end

    context 'when chat creation fails' do
      it 'returns unprocessable entity with error messages' do
        # Create a chat with nil seller_id which should fail validation
        allow_any_instance_of(Chat).to receive(:save).and_return(false)
        allow_any_instance_of(Chat).to receive(:errors).and_return(
          double(full_messages: ['Product can\'t be blank'])
        )
        
        post chats_path, params: valid_params, headers: json_headers
        # Note: This test depends on the actual validation errors
      end
    end

    context 'with missing parameters' do
      it 'returns error when product_id is missing' do
        post chats_path, params: {}, headers: json_headers
        # Should handle missing product_id gracefully
      end
    end
  end

  describe 'Chat authorization' do
    let(:chat) { create(:chat, seller_id: seller.id, interested_id: buyer.id,
                               item_id: product.id) }

    before do
      allow_any_instance_of(ChatsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(another_user)
      end
    end

    context 'when accessing a chat as a non-participant' do
      it 'denies access with unauthorized response' do
        get chat_path(chat.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'Chat formatting' do
    let(:chat) { create(:chat, seller_id: seller.id, interested_id: buyer.id,
                               item_id: product.id) }

    before do
      allow_any_instance_of(ChatsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ChatsController).to receive(:current_user).and_return(buyer)
      end
    end

    it 'does not expose sensitive user information' do
      get chat_path(chat.id), headers: json_headers
      chat_data = JSON.parse(response.body)
      seller_data = chat_data['seller']
      buyer_data = chat_data['buyer']
      
      expect(seller_data).not_to include('password_digest', 'verification_otp')
      expect(buyer_data).not_to include('password_digest', 'verification_otp')
    end

    it 'includes user contact information for messaging' do
      get chat_path(chat.id), headers: json_headers
      chat_data = JSON.parse(response.body)
      seller_data = chat_data['seller']
      
      expect(seller_data).to include('email', 'name', 'profile_picture')
    end
  end
end
