class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :actor_id
      t.string :action
      t.integer :target_id
      t.string :target_type
      t.datetime :read_at

      t.timestamps
    end
  end
end
