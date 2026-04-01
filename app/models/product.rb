class Product < ApplicationRecord
    belongs_to :buyer, class_name: 'User', foreign_key: 'buyer_id', optional: true
    belongs_to :seller, class_name: 'User', foreign_key: 'seller_id'
    belongs_to :category, optional: true

    has_many :interests, class_name: 'Interest', foreign_key: 'item_id', dependent: :destroy
    has_many :price_histories, class_name: 'PriceHistory', foreign_key: 'product_id', dependent: :destroy
    has_many :chats, foreign_key: 'item_id', dependent: :destroy

    has_many_attached :images
  
    validates :name, presence: true
    validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
    validates :seller_id, presence: true

    after_save :record_price_history, if: :saved_change_to_price? 
  
    include PgSearch::Model

    pg_search_scope :search_by_name, against: :name, using: { trigram: { threshold: 0.2 } }
    # Adjust the threshold from 0 to 1 for strictness

    private

    def record_price_history
        price_histories.create!(
            date: Time.current,
            price: price
        )
    end
end
