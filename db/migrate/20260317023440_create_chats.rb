class CreateChats < ActiveRecord::Migration[8.1]
  def change
    create_table :chats do |t|
      t.references :seller, null: false, foreign_key: { to_table: :users }
      t.references :interested, null: false, foreign_key: { to_table: :users }
      t.references :item, null: false, foreign_key: { to_table: :products }

      t.timestamps
    end
  end
end
