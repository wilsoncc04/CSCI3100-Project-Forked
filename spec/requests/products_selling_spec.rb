require 'rails_helper'

RSpec.describe 'Products Selling API', type: :request do
  let(:user) { create(:user, verified_at: Time.current) }
  let(:other_user) { create(:user, verified_at: Time.current) }
  let(:category) { create(:category) }
  let(:headers) { { 'ACCEPT' => 'application/json' } }

  let!(:user_products) do
    create_list(:product, 3, seller: user, category: category)
  end

  let!(:other_products) do
    create_list(:product, 2, seller: other_user, category: category)
  end

  describe 'GET /products/selling' do
    context 'when user is authenticated' do
      before do
        allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
        allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_call_original
      end

      it 'returns status code 200' do
        get selling_products_path, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns only the products belonging to the current user' do
        get selling_products_path, headers: headers
        json = JSON.parse(response.body)
        
        expect(json).to be_an(Array)
        expect(json.size).to eq(3)
        
        product_ids = json.map { |p| p['id'] }
        user_product_ids = user_products.map(&:id)
        
        expect(product_ids).to match_array(user_product_ids)
        
        other_product_ids = other_products.map(&:id)
        expect(product_ids).not_to include(*other_product_ids)
      end
    end

    context 'when user is not authenticated' do
      before do
        allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(nil)
        allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_call_original
      end

      it 'returns status code 401' do
        get selling_products_path, headers: headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /products without images' do
    let(:valid_params) do
      {
        product: {
          name: 'No Image Product',
          description: 'Product without images',
          price: 100.0,
          category_id: category.id,
          status: 'available',
          location: 'Library',
          contact: 'test@example.com'
        }
      }
    end

    before do
      allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
      allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_return(true)
    end

    it 'creates product successfully without images' do
      expect {
        post products_path, params: valid_params, headers: headers
      }.to change(Product, :count).by(1)
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['images']).to eq([])
    end
  end

  describe 'PATCH /products/:id without images' do
    let(:product) { create(:product, seller: user, category: category) }
    
    before do
      allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
      allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_return(true)
    end

    it 'updates product successfully without changing images' do
      patch product_path(product), params: { product: { name: 'Updated Name' } }, headers: headers
      
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['name']).to eq('Updated Name')
    end

    it 'clears images if empty images param is sent' do
      # First attach an image
      file = Tempfile.new(['test', '.jpg'])
      file.write("test")
      file.rewind
      uploaded_file = Rack::Test::UploadedFile.new(file, 'image/jpeg')
      product.images.attach(uploaded_file)
      
      expect(product.images).to be_attached
      
      # Now update with empty images array
      # Note: The controller purge images if params[:images] is present
      patch product_path(product), params: { images: [] }, headers: headers
      
      expect(response).to have_http_status(:ok)
      product.reload
      expect(product.images).not_to be_attached
    end
  end
end
