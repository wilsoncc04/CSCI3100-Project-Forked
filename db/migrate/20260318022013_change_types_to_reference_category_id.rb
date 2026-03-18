class ChangeTypesToReferenceCategoryId < ActiveRecord::Migration[8.1]
  def change
    remove_column :products, :type, :string

    add_reference :products, :category, foreign_key: { to_table: :categories}
  end
end
