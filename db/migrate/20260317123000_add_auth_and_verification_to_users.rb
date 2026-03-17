class AddAuthAndVerificationToUsers < ActiveRecord::Migration[8.1]
  def change
    # rename plain `password` to `password_digest` for has_secure_password
    if column_exists?(:users, :password)
      rename_column :users, :password, :password_digest
    else
      add_column :users, :password_digest, :string
    end

    add_column :users, :cuhk_id, :string
    add_column :users, :is_seller, :boolean, default: false, null: false
    add_column :users, :seller_rating, :float, default: 0.0, null: false
    add_column :users, :seller_review_count, :integer, default: 0, null: false
    add_column :users, :verified_at, :datetime
    add_column :users, :verification_token, :string

    add_index :users, :verification_token, unique: true
    add_index :users, :cuhk_id, unique: true
  end
end
