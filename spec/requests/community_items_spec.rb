require 'rails_helper'

RSpec.describe "CommunityItems", type: :request do
  let(:user) { User.create!(name: "Test User", email: "1155123456@link.cuhk.edu.hk", password: "password", college: "Chung Chi College", verified_at: Time.now) }
  let(:other_user) { User.create!(name: "Other User", email: "1155654321@link.cuhk.edu.hk", password: "password", college: "New Asia College", verified_at: Time.now) }
  let(:product) { Product.create!(name: "Test Product", price: 100, seller: user, status: "available") }
  let(:other_product) { Product.create!(name: "Other Product", price: 200, seller: other_user, status: "available") }

  before do
    post "/sessions", params: { session: { email: user.email, password: "password" } }, headers: { "Accept": "application/json" }
  end

  describe "GET /community_items" do
    it "returns a list of community items" do
      CommunityItem.create!(user: user, product: product, description: "Test Ad", college: "Chung Chi College")
      get "/community_items", headers: { "Accept": "application/json" }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first["description"]).to eq("Test Ad")
    end

    it "filters by college" do
      CommunityItem.create!(user: user, product: product, description: "CC Ad", college: "Chung Chi College")
      CommunityItem.create!(user: other_user, product: other_product, description: "NA Ad", college: "New Asia College")

      get "/community_items", params: { college: "Chung Chi College" }, headers: { "Accept": "application/json" }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first["college"]).to eq("Chung Chi College")
    end
  end

  describe "POST /community_items" do
    it "creates a new community item" do
      params = {
        community_item: {
          product_id: product.id,
          description: "New Community Ad",
          college: "Chung Chi College"
        }
      }
      post "/community_items", params: params, headers: { "Accept": "application/json" }
      expect(response).to have_http_status(:created)
      expect(CommunityItem.count).to eq(1)
    end

    it "fails to create with invalid params" do
      params = { community_item: { description: "" } }
      post "/community_items", params: params, headers: { "Accept": "application/json" }
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "PATCH /community_items/:id" do
    let!(:item) { CommunityItem.create!(user: user, product: product, description: "Old Description", college: "Chung Chi College") }

    it "updates the community item" do
      patch "/community_items/#{item.id}", params: { community_item: { description: "New Description" } }, headers: { "Accept": "application/json" }
      expect(response).to have_http_status(:ok)
      expect(item.reload.description).to eq("New Description")
    end

    it "fails to update if not owner" do
      # Switch to other user
      delete "/sessions/destroy"
      post "/sessions", params: { session: { email: other_user.email, password: "password" } }, headers: { "Accept": "application/json" }

      patch "/community_items/#{item.id}", params: { community_item: { description: "Hacked" } }, headers: { "Accept": "application/json" }
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /community_items/:id" do
    let!(:item) { CommunityItem.create!(user: user, product: product, description: "To be deleted", college: "Chung Chi College") }

    it "deletes the community item" do
      expect {
        delete "/community_items/#{item.id}", headers: { "Accept": "application/json" }
      }.to change(CommunityItem, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
