class CreateSolidCableMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :solid_cable_messages do |t|
      t.binary :channel, null: false, limit: 1024
      t.binary :payload, null: false, limit: 1.megabyte
      t.datetime :created_at, null: false

      t.index [ :channel ], name: "index_solid_cable_messages_on_channel"
      t.index [ :created_at ], name: "index_solid_cable_messages_on_created_at"
    end
  end
end
