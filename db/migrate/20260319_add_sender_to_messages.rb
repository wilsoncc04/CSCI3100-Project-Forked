class AddSenderToMessages < ActiveRecord::Migration[8.1]
  def change
    add_column :messages, :sender_id, :bigint unless column_exists?(:messages, :sender_id)
    add_foreign_key :messages, :users, column: :sender_id unless foreign_key_exists?(:messages, :users, column: :sender_id)
  end
end
