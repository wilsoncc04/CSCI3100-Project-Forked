class Product < ApplicationRecord
    belongs_to :buyer, class_name: 'User', foreign_key: 'buyer_id'
    belongs_to :seller, class_name: 'User', foreign_key: 'seller_id'
    belongs_to :category, optional: true

    has_many :interests, class_name: 'Interest', foreign_key: 'item_id', dependent: :destroy
    has_many :price_histories, class_name: 'PriceHistory', foreign_key: 'product_id', dependent: :destroy
    has_many :chats, foreign_key: 'item_id', dependent: :destroy
end
