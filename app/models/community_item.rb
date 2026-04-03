class CommunityItem < ApplicationRecord
  belongs_to :user
  belongs_to :product

  validates :description, presence: true
  validates :college, presence: true

  # Ensure the seller of the product is the same user creating the community item
  validate :user_is_product_seller

  private

  def user_is_product_seller
    if product && user && product.seller_id != user.id
      errors.add(:user, "must be the seller of the product")
    end
  end
end
