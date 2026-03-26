class ChangeUserTable < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :is_seller, :boolean
    add_column :users, :is_admin, :boolean
  end
end
