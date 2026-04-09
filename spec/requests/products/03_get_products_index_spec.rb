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

  describe 'GET /products (index)' do
    context 'with products containing images' do
      before do
        # Create products with images
        3.times do
          post products_path, params: {
            product: {
              name: "Product #{SecureRandom.hex(4)}",
              description: 'Test product',
              price: 100.0,
              seller_id: seller.id,
              buyer_id: buyer.id,
              category_id: category.id,
              status: 'available',
              location: 'Dorm',
              contact: 'contact@example.com'
            },
            images: [create_test_image]
          }
        end
      end

      it 'lists products' do
        get products_path
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data).to include('data', 'pagination')
        expect(response_data['data']).to be_an(Array)
      end
    end

    context 'pagination' do
      before do
        # Create 35 products to test pagination (with default limit of 15)
        35.times do |i|
          create(:product,
            name: "Paginated Product #{i + 1}",
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id
          )
        end
      end

      it 'returns first page with default limit' do
        get products_path
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to eq(15)
        expect(response_data['pagination']['current_page']).to eq(1)
        expect(response_data['pagination']['limit']).to eq(15)
        expect(response_data['pagination']['total_count']).to eq(35)
        expect(response_data['pagination']['total_pages']).to eq(3)
      end

      it 'returns second page with custom limit' do
        get products_path, params: { page: 2, limit: 10 }
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to eq(10)
        expect(response_data['pagination']['current_page']).to eq(2)
        expect(response_data['pagination']['limit']).to eq(10)
        expect(response_data['pagination']['total_count']).to eq(35)
        expect(response_data['pagination']['total_pages']).to eq(4)
      end

      it 'returns last page with remaining items' do
        get products_path, params: { page: 3, limit: 15 }
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to eq(5)
        expect(response_data['pagination']['current_page']).to eq(3)
        expect(response_data['pagination']['total_pages']).to eq(3)
      end

      it 'handles invalid page numbers gracefully' do
        get products_path, params: { page: 0 }
        response_data = JSON.parse(response.body)
        expect(response_data['pagination']['current_page']).to eq(1)
      end

      it 'handles invalid limit gracefully' do
        get products_path, params: { limit: 0 }
        response_data = JSON.parse(response.body)
        expect(response_data['pagination']['limit']).to eq(15)
      end

      it 'returns correct pagination data for custom limit' do
        get products_path, params: { limit: 8 }
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to eq(8)
        expect(response_data['pagination']['total_pages']).to eq(5)
      end
    end

    context 'fuzzy search with pagination' do
      before do
        # Create products with similar names for fuzzy search testing
        create(:product, name: 'iPhone 13 Pro Max', seller_id: seller.id, buyer_id: buyer.id, category_id: category.id)
        create(:product, name: 'iPhone 13 Pro', seller_id: seller.id, buyer_id: buyer.id, category_id: category.id)
        create(:product, name: 'iPhone 12 Pro', seller_id: seller.id, buyer_id: buyer.id, category_id: category.id)
        create(:product, name: 'Samsung Galaxy S21', seller_id: seller.id, buyer_id: buyer.id, category_id: category.id)
        create(:product, name: 'Apple iPad Pro', seller_id: seller.id, buyer_id: buyer.id, category_id: category.id)
      end

      it 'searches products by keywords (fuzzy matching)' do
        get products_path, params: { keywords: 'iPhone' }
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to be >= 1
        expect(response_data['data'].all? { |p| p['name'].include?('iPhone') }).to be true
      end

      it 'finds products with similar names (trigram matching)' do
        get products_path, params: { keywords: 'iPhon' }
        response_data = JSON.parse(response.body)
        # Fuzzy search should still find "iPhone" matches
        expect(response_data['data'].length).to be >= 1
      end

      it 'applies pagination to search results' do
        # Create many iPhone products for pagination
        15.times do |i|
          create(:product,
            name: "iPhone Variant #{i + 1}",
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id
          )
        end

        get products_path, params: { keywords: 'iPhone', page: 1, limit: 5 }
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to eq(5)
        expect(response_data['pagination']['current_page']).to eq(1)
      end

      it 'returns correct total count for filtered results' do
        get products_path, params: { keywords: 'iPhone', limit: 10 }
        response_data = JSON.parse(response.body)
        expect(response_data['pagination']['total_count']).to eq(3)
        expect(response_data['pagination']['total_pages']).to eq(1)
      end

      it 'returns empty results when no matches found' do
        get products_path, params: { keywords: 'NonexistentProduct' }
        response_data = JSON.parse(response.body)
        expect(response_data['data'].length).to eq(0)
        expect(response_data['pagination']['total_count']).to eq(0)
      end
    end

    context 'type and seller filters' do
      let!(:electronics) { create(:category, category_name: 'Electronics') }
      let!(:books) { create(:category, category_name: 'Books') }
      let!(:on_campus_seller) { create(:user, verified_at: Time.current, college: 'New Asia College', hostel: 'On-campus') }
      let!(:off_campus_seller) { create(:user, verified_at: Time.current, college: 'United College', hostel: 'Off-campus') }

      let!(:electronics_product) do
        create(:product, name: 'Gaming Mouse', seller_id: on_campus_seller.id, buyer_id: buyer.id, category_id: electronics.id)
      end

      let!(:book_product) do
        create(:product, name: 'Economics Textbook', seller_id: off_campus_seller.id, buyer_id: buyer.id, category_id: books.id)
      end

      it 'filters by type' do
        get products_path, params: { type: 'Electronics', fetch_all: 'true' }
        response_data = JSON.parse(response.body)

        expect(response).to have_http_status(:ok)
        expect(response_data['data'].map { |product| product['id'] }).to contain_exactly(electronics_product.id)
      end

      it 'filters by college' do
        get products_path, params: { college: 'United College', fetch_all: 'true' }
        response_data = JSON.parse(response.body)

        expect(response).to have_http_status(:ok)
        expect(response_data['data'].map { |product| product['id'] }).to contain_exactly(book_product.id)
      end

      it 'filters by hall using seller hostel' do
        get products_path, params: { hall: 'On-campus', fetch_all: 'true' }
        response_data = JSON.parse(response.body)

        expect(response).to have_http_status(:ok)
        expect(response_data['data'].map { |product| product['id'] }).to contain_exactly(electronics_product.id)
      end

      it 'returns all products when fetch_all is true' do
        get products_path, params: { fetch_all: 'true', limit: 1 }
        response_data = JSON.parse(response.body)

        expect(response).to have_http_status(:ok)
        expect(response_data['data'].length).to eq(2)
        expect(response_data['pagination']['total_count']).to eq(2)
      end
    end
  end

end
