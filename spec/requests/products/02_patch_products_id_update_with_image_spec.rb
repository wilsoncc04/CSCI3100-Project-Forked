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
    file = Tempfile.new([ 'test_image', '.jpg' ], encoding: 'ASCII-8BIT')
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
          images: [ initial_image ]
        }
        product = Product.last

        # Update with new image
        new_image = create_test_image
        patch product_path(product.id), params: {
          images: [ new_image ]
        }

        product.reload
        expect(product.images.count).to eq(1)
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
          images: [ create_test_image ]
        }
        product = Product.last

        # Update
        new_image = create_test_image
        patch product_path(product.id), params: {
          images: [ new_image ]
        }

        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data['images'].count).to eq(1)
      end

      it 'does not create price history when only images are replaced' do
        # Create product with initial image
        post products_path, params: {
          product: {
            name: 'Product',
            description: 'Description',
            price: 100.0,
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id,
            status: 'available',
            location: 'Dorm',
            contact: 'contact@example.com'
          },
          images: [ create_test_image ]
        }
        product = Product.last
        initial_price_history_count = product.price_histories.count

        # Update only images, not price
        patch product_path(product.id), params: {
          images: [ create_test_image ]
        }

        product.reload
        expect(product.price_histories.count).to eq(initial_price_history_count)
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
        expect(product.images.count).to eq(3)
      end

      it 'records price history when updating multiple prices' do
        # Create product with initial price
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

        # First update
        patch product_path(product.id), params: {
          product: {
            price: 150.0
          },
          images: create_multiple_test_images(3)
        }

        product.reload
        first_update_count = product.price_histories.count

        # Second update
        patch product_path(product.id), params: {
          product: {
            price: 200.0
          }
        }

        product.reload
        expect(product.price_histories.count).to eq(first_update_count + 1)
        expect(product.price_histories.last.price).to eq(200.0)
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
          images: [ create_test_image ]
        }
        product = Product.last
        initial_count = product.images.count

        # Update without images
        patch product_path(product.id), params: {
          product: {
            name: 'Updated Name'
          }
        }

        product.reload
        expect(product.images.count).to eq(initial_count)
        expect(product.name).to eq('Updated Name')
      end

      it 'does not create price history when updating non-price attributes' do
        # Create product
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
          images: [ create_test_image ]
        }
        product = Product.last
        initial_price_history_count = product.price_histories.count

        # Update non-price attribute
        patch product_path(product.id), params: {
          product: {
            name: 'Updated Name'
          }
        }

        product.reload
        expect(product.price_histories.count).to eq(initial_price_history_count)
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
          images: [ create_test_image ]
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
        expect(product.images.count).to eq(2)
      end

      it 'creates price history record when price is updated' do
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
          images: [ create_test_image ]
        }
        product = Product.last
        initial_price_history_count = product.price_histories.count

        # Update price
        expect {
          patch product_path(product.id), params: {
            product: {
              price: 200.0
            }
          }
        }.to change(PriceHistory, :count).by(1)

        product.reload
        expect(product.price).to eq(200.0)
        expect(product.price_histories.count).to eq(initial_price_history_count + 1)
        expect(product.price_histories.last.price).to eq(200.0)
      end
    end

    context 'with community promotion updates' do
      it 'creates community item when update enables promotion' do
        post products_path, params: {
          product: {
            name: 'Promoted Product',
            description: 'Description',
            price: 100.0,
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id,
            status: 'available',
            location: 'Dorm',
            contact: 'contact@example.com'
          }
        }
        product = Product.last

        expect {
          patch product_path(product.id), params: {
            promote_to_community: 'true',
            community_description: 'Great condition and negotiable'
          }
        }.to change(CommunityItem, :count).by(1)

        community_item = CommunityItem.find_by(product: product)
        expect(response).to have_http_status(:ok)
        expect(community_item).to be_present
        expect(community_item.description).to eq('Great condition and negotiable')
      end

      it 'removes existing community item when promotion is disabled' do
        post products_path, params: {
          product: {
            name: 'Product With Community Post',
            description: 'Description',
            price: 100.0,
            seller_id: seller.id,
            buyer_id: buyer.id,
            category_id: category.id,
            status: 'available',
            location: 'Dorm',
            contact: 'contact@example.com'
          },
          promote_to_community: 'true',
          community_description: 'Initial community post'
        }
        product = Product.last
        expect(CommunityItem.find_by(product: product)).to be_present

        expect {
          patch product_path(product.id), params: {
            promote_to_community: 'false'
          }
        }.to change(CommunityItem, :count).by(-1)

        expect(response).to have_http_status(:ok)
        expect(CommunityItem.find_by(product: product)).to be_nil
      end
    end
  end
end
