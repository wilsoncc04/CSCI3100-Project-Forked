class Product < ApplicationRecord
    belongs_to :buyer, class_name: 'User'
    belongs_to :seller, class_name: 'User'
    belongs_to :category, class_name: 'Category'

    has_many :item, class_name: 'Interest', foreign_key: 'item_id'
end
