class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|

      t.references :seller, null: false, foreign_key: { to_table: :users }
      t.references :interested, null: false, foreign_key: { to_table: :users }
      t.references :item, null: false, foreign_key: { to_table: :products}

      t.text :message

      t.timestamps # we can probably sort by time to get a chat message timeline
    end
  end
end
