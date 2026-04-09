require 'rails_helper'
require 'tempfile'

# Comprehensive tests for Products API including image upload functionality
RSpec.describe 'Products API', type: :request do
  # Test data setup
  let(:seller) { create(:user, verified_at: Time.current) }
  let(:buyer) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  # Helper method to create test image files in memory
  def create_test_image
    # Create a temporary file that persists for the duration of the test
    file = Tempfile.new(['test_image', '.jpg'], encoding: 'ASCII-8BIT')
    file.write("fake JPEG content for testing")
    file.flush
    file.rewind
    # Return an uploaded file that keeps the file open
    Rack::Test::UploadedFile.new(file, 'image/jpeg', 'binary')
  end

  # Helper method to create multiple test images
  def create_multiple_test_images(count)
    (1..count).map { create_test_image }
  end

  describe 'GET /products/:id (show)' do
    let!(:product) do
      create(
        :product,
        name: 'Show Test Product',
        description: 'Test product',
        price: 100.0,
        seller_id: seller.id,
        buyer_id: buyer.id,
        category_id: category.id,
        status: 'available',
        location: 'Dorm',
        contact: 'contact@example.com'
      )
    end

    before do
      product.images.attach(create_multiple_test_images(2))
    end

    it 'returns product details with image URLs' do
      get product_path(product.id)
      response_data = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(response_data['id']).to eq(product.id)
      expect(response_data['name']).to eq('Show Test Product')
      expect(response_data['images']).to be_an(Array)
      expect(response_data['images'].count).to eq(2)
    end

    it 'returns is_owner true when current user is seller' do
      allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)

      get product_path(product.id)
      response_data = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(response_data['is_owner']).to eq(true)
    end

    it 'returns is_liked true when current user has liked the product' do
      create(:interest, interested_id: buyer.id, item_id: product.id)
      allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)

      get product_path(product.id)
      response_data = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(response_data['is_liked']).to eq(true)
    end

    it 'returns community promotion fields when product is promoted' do
      create(:community_item, product: product, user: seller, description: 'Featured in community', college: seller.college)

      get product_path(product.id)
      response_data = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(response_data['promote_to_community']).to eq(true)
      expect(response_data['community_description']).to eq('Featured in community')
    end

    it 'returns not found for unknown product' do
      get product_path(-1)

      expect(response).to have_http_status(:not_found)
      response_data = JSON.parse(response.body)
      expect(response_data['error']).to eq('Product not found')
    end
  end

end
