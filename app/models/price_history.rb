class PriceHistory < ApplicationRecord
    belongs_to :product, class_name: 'Product'

    validates :category_id, :price, presence: true
end
