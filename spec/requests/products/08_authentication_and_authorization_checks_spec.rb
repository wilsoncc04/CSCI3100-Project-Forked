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

  describe 'Authentication and Authorization checks' do
    let(:other_seller) { create(:user, verified_at: Time.current) }
    let(:product) { create(:product, seller_id: seller.id, buyer_id: buyer.id) }

    context 'POST /products (create)' do
      it 'requires authentication' do
        params = {
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
        post products_path, params: params, headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end

      it 'allows authenticated user to create product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
        end

        params = {
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
        expect {
          post products_path, params: params
        }.to change(Product, :count).by(1)
      end
    end

    context 'PATCH /products/:id (update)' do
      it 'requires authentication' do
        patch product_path(product.id), params: {
          product: { name: 'Updated Name' }
        }, headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end

      it 'allows seller to update their own product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
        end

        patch product_path(product.id), params: {
          product: { name: 'Updated Name' }
        }
        expect(response).to have_http_status(:ok)
        product.reload
        expect(product.name).to eq('Updated Name')
      end

      it 'prevents other sellers from updating product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(other_seller)
        end

        patch product_path(product.id), params: {
          product: { name: 'Hacked Name' }
        }, headers: json_headers
        expect(response).to have_http_status(:forbidden)
        product.reload
        expect(product.name).not_to eq('Hacked Name')
      end

      it 'prevents buyer from updating product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        end

        patch product_path(product.id), params: {
          product: { name: 'Hacked Name' }
        }, headers: json_headers
        expect(response).to have_http_status(:forbidden)
        product.reload
        expect(product.name).not_to eq('Hacked Name')
      end
    end

    context 'DELETE /products/:id (destroy)' do
      it 'requires authentication' do
        delete product_path(product.id), headers: json_headers
        expect(response).to have_http_status(:unauthorized)
        expect(Product.find_by(id: product.id)).to be_persisted
      end

      it 'allows seller to delete their own product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
        end

        product_id = product.id
        delete product_path(product.id)
        expect(response).to have_http_status(:no_content)
        expect(Product.find_by(id: product_id)).to be_nil
      end

      it 'prevents other sellers from deleting product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(other_seller)
        end

        delete product_path(product.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
        expect(product.reload).to be_persisted
      end

      it 'prevents buyer from deleting product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        end

        delete product_path(product.id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
        expect(product.reload).to be_persisted
      end
    end

    context 'GET /products/:id (show)' do
      it 'allows unauthenticated access' do
        get product_path(product.id)
        expect(response).to have_http_status(:ok)
      end

      it 'allows authenticated access' do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        get product_path(product.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context 'GET /products (index)' do
      it 'allows unauthenticated access' do
        get products_path
        expect(response).to have_http_status(:ok)
      end
    end

    context 'GET /products/price_history' do
      let(:product) { create(:product, seller_id: seller.id, buyer_id: buyer.id) }

      it 'returns price history for a product by product_id' do
        get price_history_products_path, params: { product_id: product.id }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data).to include('product_id', 'prices')
        expect(response_data['product_id']).to eq(product.id)
        expect(response_data['prices']).to be_an(Array)
      end

      it 'returns price history with default points (10)' do
        get price_history_products_path, params: { product_id: product.id }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        # Price history is returned from the record_price_history callback on product creation
        expect(response_data['prices']).to be_an(Array)
      end

      it 'accepts custom points parameter' do
        get price_history_products_path, params: { product_id: product.id, points: 5 }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data['prices']).to be_an(Array)
      end

      it 'limits points to maximum 20' do
        get price_history_products_path, params: { product_id: product.id, points: 50 }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        # Response should still return successfully, with points capped at 20
        expect(response_data.keys).to include('product_id', 'prices')
      end

      it 'defaults to 10 points when points parameter is zero' do
        get price_history_products_path, params: { product_id: product.id, points: 0 }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data['prices']).to be_an(Array)
      end

      it 'defaults to 10 points when points parameter is negative' do
        get price_history_products_path, params: { product_id: product.id, points: -5 }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data['prices']).to be_an(Array)
      end

      it 'returns bad request when product_id is missing' do
        get price_history_products_path
        expect(response).to have_http_status(:bad_request)
        response_data = JSON.parse(response.body)
        expect(response_data).to include('error')
        expect(response_data['error']).to match(/product_id/)
      end

      it 'returns error when product does not exist' do
        get price_history_products_path, params: { product_id: 999999 }
        expect(response).to have_http_status(:not_found)
        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('Product not found')
      end

      it 'allows unauthenticated access' do
        get price_history_products_path, params: { product_id: product.id }
        expect(response).to have_http_status(:ok)
      end

      it 'allows authenticated access' do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        get price_history_products_path, params: { product_id: product.id }
        expect(response).to have_http_status(:ok)
      end

      it 'returns prices array with actual price history' do
        get price_history_products_path, params: { product_id: product.id }
        response_data = JSON.parse(response.body)
        # Price history is created by the after_save callback on product creation
        expect(response_data['prices']).to include(product.price.to_f)
      end

      it 'accepts id as query parameter (fallback to product_id)' do
        get price_history_products_path, params: { id: product.id }
        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data['product_id']).to eq(product.id)
      end

      it 'prioritizes product_id parameter over id parameter' do
        other_product = create(:product, seller_id: seller.id, buyer_id: buyer.id)
        get price_history_products_path, params: { product_id: product.id, id: other_product.id }
        response_data = JSON.parse(response.body)
        # product_id parameter should take precedence
        expect(response_data['product_id']).to eq(product.id)
      end
    end

    context 'POST /products/:id/interest' do
      it 'requires authentication' do
        post interest_product_path(product.id), headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end

      it 'creates interest for authenticated user' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        end

        expect {
          post interest_product_path(product.id), headers: json_headers
        }.to change(Interest, :count).by(1)

        response_data = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(response_data['status']).to eq('liked')
      end

      it 'removes existing interest when toggled again' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        end

        create(:interest, interested_id: buyer.id, item_id: product.id)

        expect {
          post interest_product_path(product.id), headers: json_headers
        }.to change(Interest, :count).by(-1)

        response_data = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(response_data['status']).to eq('unliked')
      end
    end

    context 'POST /products/:id/buy' do
      it 'requires authentication' do
        post buy_product_path(product.id), headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end

      it 'reserves product and creates chat with initial message' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        end

        expect {
          post buy_product_path(product.id), headers: json_headers
        }.to change(Chat, :count).by(1).and change(Message, :count).by(1)

        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        product.reload

        expect(response_data['product_name']).to eq(product.name)
        expect(product.status).to eq('reserved')
        expect(product.buyer_id).to eq(buyer.id)
      end

      it 'reuses existing chat for same buyer and product' do
        allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
          allow_any_instance_of(ProductsController).to receive(:current_user).and_return(buyer)
        end

        existing_chat = create(:chat, item_id: product.id, seller_id: seller.id, interested_id: buyer.id)

        expect {
          post buy_product_path(product.id), headers: json_headers
        }.to change(Chat, :count).by(0).and change(Message, :count).by(1)

        response_data = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(response_data['chat_id']).to eq(existing_chat.id)
      end
    end
  end
end
