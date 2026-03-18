class PriceHistory < ApplicationRecord
    belongs_to :category, class_name: 'Category'

    validates :category_id, :price, presence: true
end
