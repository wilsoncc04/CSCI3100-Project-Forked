class InitSolidCable < ActiveRecord::Migration[8.1]
  def change
    load Rails.root.join("db/cable_schema.rb")
  end
end
