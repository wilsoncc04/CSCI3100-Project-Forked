FactoryBot.define do
  factory :chat do
    association :seller, factory: :user
    association :interested_user, factory: :user

    # Create product with seller
    item_id { create(:product, seller_id: seller.id).id }

    # Map to the actual column names
    seller_id { seller.id }
    interested_id { interested_user.id }
  end
end
