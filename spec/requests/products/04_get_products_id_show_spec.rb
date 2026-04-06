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
    context 'with product containing images' do
      before do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
        end
        post products_path, params: {
          product: {
            name: 'Show Test Product',
            description: 'Test product',
            price: 100.0,
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id,
            status: 'available',
            location: 'Dorm',
            contact: 'contact@example.com'
          },
          images: create_multiple_test_images(2)
        }
      end

      it 'returns product details' do
        product = Product.last
        get product_path(product.id)
        expect(response).to have_http_status(:ok)
      end
    end
  end

end
