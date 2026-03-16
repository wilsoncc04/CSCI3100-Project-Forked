class Message < ApplicationRecord
    belongs_to :seller_id, class_name: 'User'
    belongs_to :interested_id, class_name: 'User'
    belongs_to :item_id, class_name: 'Product'
end
