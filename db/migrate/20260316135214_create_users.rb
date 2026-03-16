class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|

      t.string :name, null: false
      t.string :email, null: false
      t.string :password, null: false # hashed?
      t.string :profile_picture # link to pfp

      t.string :college
      t.string :hostel

      t.timestamps
    end
  end
end
