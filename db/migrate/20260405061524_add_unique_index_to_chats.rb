class AddUniqueIndexToChats < ActiveRecord::Migration[8.1]
  def change
    add_index :chats, [ :item_id, :seller_id, :interested_id ], unique: true, name: 'index_chats_on_item_seller_and_interested'
  end
end
