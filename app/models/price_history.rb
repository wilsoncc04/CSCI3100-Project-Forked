class PriceHistory < ApplicationRecord
    belongs_to :product

    validates :product_id, :price, presence: true
end
