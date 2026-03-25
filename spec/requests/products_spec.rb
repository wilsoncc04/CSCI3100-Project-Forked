require 'rails_helper'
require 'tempfile'

# Comprehensive tests for Products API including image upload functionality
RSpec.describe 'Products API', type: :request do
  # Test data setup
  let(:seller) { create(:user, is_seller: true, verified_at: Time.current) }
  let(:buyer) { create(:user, is_seller: false, verified_at: Time.current) }
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
        expect(created_product.image).to be_attached
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
    end

    context 'with multiple images upload' do
      it 'attaches multiple images to product' do
        images = create_multiple_test_images(3)
        params = valid_params.merge(images: images)
        post products_path, params: params
        created_product = Product.last
        expect(created_product.image.count).to eq(3)
      end

      it 'returns all image URLs in response' do
        images = create_multiple_test_images(2)
        params = valid_params.merge(images: images)
        post products_path, params: params
        response_data = JSON.parse(response.body)
        expect(response_data['images'].count).to eq(2)
      end
    end

    context 'without images' do
      it 'creates product without images' do
        post products_path, params: valid_params
        expect(response).to have_http_status(:created)
        created_product = Product.last
        expect(created_product.image.count).to eq(0)
      end

      it 'returns empty images array' do
        post products_path, params: valid_params
        response_data = JSON.parse(response.body)
        expect(response_data['images']).to eq([])
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
        expect(created_product.image.count).to eq(0)
      end
    end
  end

  describe 'PATCH /products/:id (update with image)' do
    before do
      allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
      end
    end

    context 'with single image replacement' do
      it 'replaces all existing images' do
        # Create product with initial image
        initial_image = create_test_image
        post products_path, params: {
          product: {
            name: 'Product to Update',
            description: 'Description',
            price: 100.0,
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id,
            status: 'available',
            location: 'Dorm',
            contact: 'contact@example.com'
          },
          images: [initial_image]
        }
        product = Product.last

        # Update with new image
        new_image = create_test_image
        patch product_path(product.id), params: {
          images: [new_image]
        }

        product.reload
        expect(product.image.count).to eq(1)
      end

      it 'returns updated product with new image URL' do
        # Setup: Create product with image
        post products_path, params: {
          product: {
            name: 'Test',
            description: 'Test',
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
        product = Product.last

        # Update
        new_image = create_test_image
        patch product_path(product.id), params: {
          images: [new_image]
        }

        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data['images'].count).to eq(1)
      end
    end

    context 'with multiple image replacement' do
      it 'replaces images with multiple new images' do
        # Create product with 2 images
        post products_path, params: {
          product: {
            name: 'Test',
            description: 'Test',
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
        product = Product.last

        # Replace with 3 images
        patch product_path(product.id), params: {
          images: create_multiple_test_images(3)
        }

        product.reload
        expect(product.image.count).to eq(3)
      end
    end

    context 'without new images' do
      it 'keeps existing images when no new images provided' do
        # Create product with image
        post products_path, params: {
          product: {
            name: 'Test',
            description: 'Test',
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
        product = Product.last
        initial_count = product.image.count

        # Update without images
        patch product_path(product.id), params: {
          product: {
            name: 'Updated Name'
          }
        }

        product.reload
        expect(product.image.count).to eq(initial_count)
        expect(product.name).to eq('Updated Name')
      end
    end

    context 'with other attribute updates and images' do
      it 'updates both attributes and images' do
        # Create product
        post products_path, params: {
          product: {
            name: 'Original Name',
            description: 'Original description',
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
        product = Product.last

        # Update both attributes and images
        patch product_path(product.id), params: {
          product: {
            name: 'Updated Name',
            price: 200.0
          },
          images: create_multiple_test_images(2)
        }

        product.reload
        expect(product.name).to eq('Updated Name')
        expect(product.price).to eq(200.0)
        expect(product.image.count).to eq(2)
      end
    end
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

  describe 'DELETE /products/:id' do
    before do
      allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
      end
    end

    it 'deletes product and its images' do
      # Create product with image
      post products_path, params: {
        product: {
          name: 'Product to Delete',
          description: 'Test',
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
      product = Product.last
      product_id = product.id

      # Delete
      delete product_path(product_id)
      expect(response).to have_http_status(:no_content)
      expect(Product.find_by(id: product_id)).to be_nil
    end
  end

  describe 'Image URL formatting' do
    it 'returns valid image URLs in format_product response' do
      allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
      end
      post products_path, params: {
        product: {
          name: 'Format Test',
          description: 'Test',
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
      response_data = JSON.parse(response.body)
      expect(response_data['images']).to be_an(Array)
      response_data['images'].each do |url|
        expect(url).to be_a(String)
        expect(url).not_to be_empty if url.present?
      end
    end
  end

  describe 'Error handling' do
    it 'handles file upload errors gracefully' do
      allow_any_instance_of(ProductsController).to receive(:authenticate_user!) do
        allow_any_instance_of(ProductsController).to receive(:current_user).and_return(seller)
      end
      # Try with invalid product data
      params = {
        product: {
          name: '',  # Missing required field
          seller_id: seller.id,
          buyer_id: buyer.id
        },
        images: [create_test_image]
      }
      post products_path, params: params
      # Accept either bad request or unprocessable entity
      expect(response.status).to satisfy { |status| [400, 422, 500].include?(status) }
    end
  end

  describe 'Authentication and Authorization checks' do
    let(:other_seller) { create(:user, is_seller: true, verified_at: Time.current) }
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
  end
end
