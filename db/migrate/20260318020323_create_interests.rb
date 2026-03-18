class CreateInterests < ActiveRecord::Migration[8.1]
  def change
    create_table :interests do |t|
      t.references :item, null: false, foreign_key: { to_table: :products }
      t.references :interested, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
