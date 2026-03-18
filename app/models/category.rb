class Category < ApplicationRecord
    has_many :category, class_name: 'PriceHistory', foreign_key: 'category_id'
end
