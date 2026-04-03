require 'rails_helper'

RSpec.describe CommunityItem, type: :model do
  let(:user) { User.create!(name: "Test User", email: "1155123456@link.cuhk.edu.hk", password: "password", college: "Chung Chi College") }
  let(:other_user) { User.create!(name: "Other User", email: "1155654321@link.cuhk.edu.hk", password: "password", college: "New Asia College") }
  let(:product) { Product.create!(name: "Test Product", price: 100, seller: user, status: "available") }

  it "is valid with valid attributes" do
    community_item = CommunityItem.new(
      user: user,
      product: product,
      description: "Great product for CC students!",
      college: "Chung Chi College"
    )
    expect(community_item).to be_valid
  end

  it "is invalid without a description" do
    community_item = CommunityItem.new(description: nil)
    expect(community_item).not_to be_valid
  end

  it "is invalid without a college" do
    community_item = CommunityItem.new(college: nil)
    expect(community_item).not_to be_valid
  end

  it "is invalid if the user is not the seller of the product" do
    community_item = CommunityItem.new(
      user: other_user,
      product: product,
      description: "Trying to promote someone else's product",
      college: "New Asia College"
    )
    expect(community_item).not_to be_valid
    expect(community_item.errors[:user]).to include("must be the seller of the product")
  end
end
