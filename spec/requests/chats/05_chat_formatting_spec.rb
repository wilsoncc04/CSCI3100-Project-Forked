require 'rails_helper'

RSpec.describe 'Chats API', type: :request do
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:product) { create(:product, seller_id: seller.id, category_id: category.id) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

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

      expect(seller_data).to include('email', 'name', 'profile_picture_url')
    end

    it 'includes serialized product image urls in chat payload' do
      image_file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/test_image.jpg'),
        'image/jpeg'
      )
      product.images.attach(image_file)

      get chat_path(chat.id), headers: json_headers
      chat_data = JSON.parse(response.body)

      expect(chat_data.dig('product', 'images')).to be_an(Array)
      expect(chat_data.dig('product', 'images').first).to be_present
    end
  end
end
