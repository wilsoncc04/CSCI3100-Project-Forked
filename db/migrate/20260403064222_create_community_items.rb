class CreateCommunityItems < ActiveRecord::Migration[8.1]
  def change
    create_table :community_items do |t|
      t.references :user, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.text :description
      t.string :college

      t.timestamps
    end
  end
end
