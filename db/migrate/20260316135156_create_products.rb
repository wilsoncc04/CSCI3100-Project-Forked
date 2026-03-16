class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|

      t.references :buyer, null: false, foreign_key: { to_table: :users }
      t.references :seller, null: false, foreign_key: { to_table: :users }

      t.string :status, null: false # available / reserved / sold
      t.string :name, null: false
      t.string :type
      t.decimal :price, null: false
      t.text :description
      t.string :contact
      t.string :image

      t.timestamps
    end
  end
end
