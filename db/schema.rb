# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_16_141307) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "messages", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "interested_id", null: false
    t.bigint "item_id", null: false
    t.text "message"
    t.bigint "seller_id", null: false
    t.datetime "updated_at", null: false
    t.index ["interested_id"], name: "index_messages_on_interested_id"
    t.index ["item_id"], name: "index_messages_on_item_id"
    t.index ["seller_id"], name: "index_messages_on_seller_id"
  end

  create_table "products", force: :cascade do |t|
    t.bigint "buyer_id", null: false
    t.string "contact"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image"
    t.string "name", null: false
    t.decimal "price", null: false
    t.bigint "seller_id", null: false
    t.string "status", null: false
    t.string "type"
    t.datetime "updated_at", null: false
    t.index ["buyer_id"], name: "index_products_on_buyer_id"
    t.index ["seller_id"], name: "index_products_on_seller_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "college"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "hostel"
    t.string "name", null: false
    t.string "password", null: false
    t.string "profile_picture"
    t.datetime "updated_at", null: false
  end

  add_foreign_key "messages", "products", column: "item_id"
  add_foreign_key "messages", "users", column: "interested_id"
  add_foreign_key "messages", "users", column: "seller_id"
  add_foreign_key "products", "users", column: "buyer_id"
  add_foreign_key "products", "users", column: "seller_id"
end
