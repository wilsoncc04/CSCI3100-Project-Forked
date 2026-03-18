class ChangePriceHistory < ActiveRecord::Migration[8.1]
  def change
    remove_reference :price_histories, :category, foreign_key: true

    add_reference :price_histories, :product, foreign_key: { to_table: 'products' }
  end
end
