class CreatePriceHistories < ActiveRecord::Migration[8.1]
  def change
    create_table :price_histories do |t|
      t.references :category, null: false, foreign_key: { to_table: :categories }
      t.decimal :price
      t.datetime :date
    end
  end
end
