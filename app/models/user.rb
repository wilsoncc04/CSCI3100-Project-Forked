class User < ApplicationRecord
    has_many :sales_as_buyer, class_name: 'Sale', foreign_key: 'buyer_id'
    has_many :sales_as_seller, class_name: 'Sale', foreign_key: 'seller_id'
end
