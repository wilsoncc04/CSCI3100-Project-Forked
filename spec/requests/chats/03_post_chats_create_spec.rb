require 'rails_helper'

RSpec.describe 'Chats API', type: :request do
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:product) { create(:product, seller_id: seller.id, category_id: category.id) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

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
        expect(response).to have_http_status(:unprocessable_content)
        response_data = JSON.parse(response.body)
        expect(response_data['errors']).to include("Product can't be blank")
      end
    end

    context 'with missing parameters' do
      it 'returns error when product_id is missing' do
        post chats_path, params: {}, headers: json_headers
        expect(response).to have_http_status(:not_found)
        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('Product not found')
      end
    end
  end

end
