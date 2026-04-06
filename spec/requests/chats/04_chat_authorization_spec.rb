require 'rails_helper'

RSpec.describe 'Chats API', type: :request do
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:product) { create(:product, seller_id: seller.id, category_id: category.id) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

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

end
