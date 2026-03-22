class RemoveNonActiveStorageColumns < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :profile_picture, :string
    remove_column :products, :image, :string
  end
end
