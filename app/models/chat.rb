class Chat < ApplicationRecord
  belongs_to :product, foreign_key: 'item_id'
  belongs_to :interested_user, foreign_key: 'interested_id', class_name: 'User'
  belongs_to :seller, foreign_key: 'seller_id', class_name: 'User'
  
  has_many :messages, foreign_key: 'chat_id', dependent: :destroy
  
  validates :item_id, :interested_id, :seller_id, presence: true
  alias_attribute :product_id, :item_id
end
