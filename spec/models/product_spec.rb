require 'rails_helper'

RSpec.describe Product, type: :model do
  let(:seller) { create(:user, verified_at: Time.current) }

  describe 'validations' do
    it 'is invalid without a name' do
      product = build(:product, seller_id: seller.id, name: nil)

      expect(product).not_to be_valid
      expect(product.errors[:name]).to include("can't be blank")
    end

    it 'is invalid with a negative price' do
      product = build(:product, seller_id: seller.id, price: -1)

      expect(product).not_to be_valid
      expect(product.errors[:price]).to include('must be greater than or equal to 0')
    end
  end

  describe '#image_urls' do
    it 'returns empty array when no images are attached' do
      product = create(:product, seller_id: seller.id)

      expect(product.image_urls).to eq([])
    end

    it 'returns blob URL for local storage service' do
      product = create(:product, seller_id: seller.id)
      image_file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/test_image.jpg'),
        'image/jpeg'
      )
      product.images.attach(image_file)

      allow(Rails.application.routes.url_helpers)
        .to receive(:rails_blob_url)
        .and_return('/rails/active_storage/blobs/test_image.jpg')

      expect(product.image_urls).to eq([ '/rails/active_storage/blobs/test_image.jpg' ])
    end

    it 'returns direct image url when storage service supports cloudinary_url' do
      product = create(:product, seller_id: seller.id)
      image_file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/test_image.jpg'),
        'image/jpeg'
      )
      product.images.attach(image_file)

      blob = product.images.first
      fake_service = double('CloudinaryLikeService')
      allow(fake_service).to receive(:respond_to?).and_return(false)
      allow(fake_service).to receive(:respond_to?).with(:cloudinary_url).and_return(true)
      allow(blob).to receive(:service).and_return(fake_service)
      allow(blob).to receive(:url).and_return('https://res.cloudinary.com/demo/image/upload/sample.jpg')

      expect(product.image_urls).to eq([ 'https://res.cloudinary.com/demo/image/upload/sample.jpg' ])
    end
  end
end
