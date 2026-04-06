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
          
          expect(product_data).to include('id', 'name', 'price', 'images')
        end

        it 'formats seller data correctly' do
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          seller_data = chats_data.first['seller']
          
          expect(seller_data).to include(
            'id', 'cuhk_id', 'email', 'name', 'profile_picture_url', 
            'is_admin', 'seller_rating'
          )
        end

        it 'formats buyer data correctly' do
          get chats_path, headers: json_headers
          chats_data = JSON.parse(response.body)
          buyer_data = chats_data.first['buyer']
          
          expect(buyer_data).to include(
            'id', 'cuhk_id', 'email', 'name', 'profile_picture_url', 
            'is_admin', 'seller_rating'
          )
        end

        it 'returns chats sorted by most recent first' do
          older_product = create(:product, seller_id: seller.id, category_id: category.id)
          newer_product = create(:product, seller_id: another_user.id, category_id: category.id)
          older_chat = create(:chat, seller_id: seller.id, interested_id: buyer.id,
                                     item_id: older_product.id,
                                     updated_at: 1.day.ago)
          newer_chat = create(:chat, seller_id: another_user.id, interested_id: buyer.id,
                                     item_id: newer_product.id,
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
        expect(response).to have_http_status(:unauthorized)
        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('unauthenticated')
      end
    end
  end

end
