class Interest < ApplicationRecord
    belongs_to :interested_user, foreign_key: 'interested_id', class_name: 'User'
    belongs_to :product, foreign_key: 'item_id'

    validates :interested_id, :item_id, presence: true
    validates :interested_id, uniqueness: { scope: :item_id }
end
