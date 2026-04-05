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

ActiveRecord::Schema[8.1].define(version: 2026_04_05_084736) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", force: :cascade do |t|
    t.string "category_name"
  end

  create_table "chats", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "interested_id", null: false
    t.bigint "item_id", null: false
    t.bigint "seller_id", null: false
    t.datetime "updated_at", null: false
    t.index ["interested_id"], name: "index_chats_on_interested_id"
    t.index ["item_id", "seller_id", "interested_id"], name: "index_chats_on_item_seller_and_interested", unique: true
    t.index ["item_id"], name: "index_chats_on_item_id"
    t.index ["seller_id"], name: "index_chats_on_seller_id"
  end

  create_table "community_items", force: :cascade do |t|
    t.string "college"
    t.datetime "created_at", null: false
    t.text "description"
    t.bigint "product_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["product_id"], name: "index_community_items_on_product_id"
    t.index ["user_id"], name: "index_community_items_on_user_id"
  end

  create_table "interests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "interested_id", null: false
    t.bigint "item_id", null: false
    t.datetime "updated_at", null: false
    t.index ["interested_id"], name: "index_interests_on_interested_id"
    t.index ["item_id"], name: "index_interests_on_item_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "chat_id", null: false
    t.datetime "created_at", null: false
    t.text "message"
    t.bigint "sender_id"
    t.datetime "updated_at", null: false
    t.index ["chat_id"], name: "index_messages_on_chat_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "action"
    t.integer "actor_id"
    t.datetime "created_at", null: false
    t.datetime "read_at"
    t.integer "target_id"
    t.string "target_type"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "price_histories", force: :cascade do |t|
    t.datetime "date"
    t.decimal "price"
    t.bigint "product_id"
    t.index ["product_id"], name: "index_price_histories_on_product_id"
  end

  create_table "products", force: :cascade do |t|
    t.bigint "buyer_id"
    t.bigint "category_id"
    t.string "condition"
    t.string "contact"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "location"
    t.string "name", null: false
    t.decimal "price", null: false
    t.bigint "seller_id", null: false
    t.string "status", null: false
    t.datetime "updated_at", null: false
    t.index ["buyer_id"], name: "index_products_on_buyer_id"
    t.index ["category_id"], name: "index_products_on_category_id"
    t.index ["seller_id"], name: "index_products_on_seller_id"
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.datetime "created_at", null: false
    t.binary "payload", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "users", force: :cascade do |t|
    t.text "bio"
    t.string "college"
    t.datetime "created_at", null: false
    t.string "cuhk_id"
    t.string "email", null: false
    t.string "hostel"
    t.boolean "is_admin"
    t.string "name", null: false
    t.string "password_digest", null: false
    t.float "seller_rating", default: 0.0, null: false
    t.integer "seller_review_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.string "verification_otp"
    t.datetime "verification_sent_at"
    t.string "verification_token"
    t.datetime "verified_at"
    t.index ["cuhk_id"], name: "index_users_on_cuhk_id", unique: true
    t.index ["verification_otp"], name: "index_users_on_verification_otp"
    t.index ["verification_token"], name: "index_users_on_verification_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "chats", "products", column: "item_id"
  add_foreign_key "chats", "users", column: "interested_id"
  add_foreign_key "chats", "users", column: "seller_id"
  add_foreign_key "community_items", "products"
  add_foreign_key "community_items", "users"
  add_foreign_key "interests", "products", column: "item_id"
  add_foreign_key "interests", "users", column: "interested_id"
  add_foreign_key "messages", "chats"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "notifications", "users"
  add_foreign_key "price_histories", "products"
  add_foreign_key "products", "categories"
  add_foreign_key "products", "users", column: "buyer_id"
  add_foreign_key "products", "users", column: "seller_id"
end
