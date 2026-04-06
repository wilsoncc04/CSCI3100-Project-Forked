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

  describe 'POST /products (create with image)' do
    let(:valid_params) do
      {
        product: {
          name: 'New Product',
          description: 'Product description',
          price: 150.0,
          seller_id: seller.id,
          buyer_id: buyer.id,
          category_id: category.id,
          status: 'available',
          location: 'Dorm',
          contact: 'contact@example.com'
        }
      }
    end

    before do
      allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
      end
    end

    context 'with single image upload' do
      it 'creates product with image successfully' do
        params = valid_params.merge(images: [create_test_image])
        expect {
          post products_path, params: params
        }.to change(Product, :count).by(1)
      end

      it 'attaches image to product' do
        params = valid_params.merge(images: [create_test_image])
        post products_path, params: params
        created_product = Product.last
        expect(created_product.images).to be_attached
      end

      it 'returns created status with image URL' do
        params = valid_params.merge(images: [create_test_image])
        post products_path, params: params
        expect(response).to have_http_status(:created)
        response_data = JSON.parse(response.body)
        expect(response_data).to include('images')
        expect(response_data['images']).to be_an(Array)
        expect(response_data['images'].first).to be_present
      end

      it 'creates price history record when product is created' do
        params = valid_params.merge(images: [create_test_image])
        expect {
          post products_path, params: params
        }.to change(PriceHistory, :count).by(1)
        created_product = Product.last
        price_history = created_product.price_histories.first
        expect(price_history.price).to eq(150.0)
        expect(price_history.date).to be_present
      end
    end

    context 'with multiple images upload' do
      it 'attaches multiple images to product' do
        images = create_multiple_test_images(3)
        params = valid_params.merge(images: images)
        post products_path, params: params
        created_product = Product.last
        expect(created_product.images.count).to eq(3)
      end

      it 'returns all image URLs in response' do
        images = create_multiple_test_images(2)
        params = valid_params.merge(images: images)
        post products_path, params: params
        response_data = JSON.parse(response.body)
        expect(response_data['images'].count).to eq(2)
      end

      it 'records price history for multiple image uploads' do
        images = create_multiple_test_images(3)
        params = valid_params.merge(images: images)
        expect {
          post products_path, params: params
        }.to change(PriceHistory, :count).by(1)
      end
    end

    context 'without images' do
      it 'creates product without images' do
        post products_path, params: valid_params
        expect(response).to have_http_status(:created)
        created_product = Product.last
        expect(created_product.images.count).to eq(0)
      end

      it 'returns empty images array' do
        post products_path, params: valid_params
        response_data = JSON.parse(response.body)
        expect(response_data['images']).to eq([])
      end

      it 'creates price history record even without images' do
        expect {
          post products_path, params: valid_params
        }.to change(PriceHistory, :count).by(1)
        created_product = Product.last
        expect(created_product.price_histories.count).to eq(1)
        expect(created_product.price_histories.first.price).to eq(150.0)
      end
    end

    context 'with community promotion' do
      it 'creates community item when promote_to_community is true' do
        params = valid_params.merge(promote_to_community: 'true', community_description: 'Best deal!')
        expect {
          post products_path, params: params
        }.to change(CommunityItem, :count).by(1)
        expect(CommunityItem.last.description).to eq('Best deal!')
      end

      it 'does not create community item when promote_to_community is false' do
        params = valid_params.merge(promote_to_community: 'false', community_description: 'Best deal!')
        expect {
          post products_path, params: params
        }.to_not change(CommunityItem, :count)
      end
    end

    context 'with invalid parameters' do
      it 'fails with missing required fields' do
        invalid_params = valid_params.deep_dup
        invalid_params[:product].delete(:name)
        post products_path, params: invalid_params
        expect(response.status).to satisfy { |status| [400, 422].include?(status) }
      end

      it 'ignores non-UploadedFile objects in images' do
        # Pass string instead of file - should be ignored
        params = valid_params.merge(images: ['not_a_file'])
        post products_path, params: params
        created_product = Product.last
        expect(created_product.images.count).to eq(0)
      end
    end
  end

end
