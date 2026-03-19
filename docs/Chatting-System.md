# Chatting System Backend Implementation

## Overview
The chatting system allows buyers and sellers to communicate about products. The system is built with Rails and includes proper associations, validations, and authorization checks.

## Database Schema

### Chats Table
- `id` - Primary key
- `item_id` - Foreign key to products (the product being discussed)
- `seller_id` - Foreign key to users (the seller)
- `interested_id` - Foreign key to users (the buyer)
- `created_at`, `updated_at` - Timestamps

### Messages Table
- `id` - Primary key
- `chat_id` - Foreign key to chats
- `sender_id` - Foreign key to users (who sent the message)
- `message` - Text content of the message
- `created_at`, `updated_at` - Timestamps

## Models

### Chat Model
**File**: `app/models/chat.rb`

Located at `/home/wilson/CSCI3100-Project-Forked/app/models/chat.rb`

```ruby
class Chat < ApplicationRecord
  belongs_to :product, foreign_key: 'item_id'
  belongs_to :interested_user, foreign_key: 'interested_id', class_name: 'User'
  belongs_to :seller, foreign_key: 'seller_id', class_name: 'User'
  
  has_many :messages, foreign_key: 'chat_id', dependent: :destroy
  
  validates :product_id, :interested_id, :seller_id, presence: true
end
```

**Key Features:**
- Links product, buyer, and seller in one conversation
- Cascade delete messages when chat is deleted
- Validates all required fields are present

### Message Model
**File**: `app/models/message.rb`

Located at `/home/wilson/CSCI3100-Project-Forked/app/models/message.rb`

```ruby
class Message < ApplicationRecord
  belongs_to :chat, foreign_key: 'chat_id'
  belongs_to :sender, foreign_key: 'sender_id', class_name: 'User'
  
  validates :chat_id, :sender_id, :message, presence: true
  
  after_create :broadcast_message
  
  private
  
  def broadcast_message
    # ActionCable broadcast - uncomment when ActionCable is set up
    # ActionCable.server.broadcast("chat_#{chat_id}", { message: self })
  end
end
```

**Key Features:**
- Tracks who sent each message via sender_id
- Validates all required fields
- Ready for ActionCable integration for real-time messaging

### User Model Updates
Social associations added to User model:
- `has_many :seller_chats` - Chats where user is the seller
- `has_many :buyer_chats` - Chats where user is the buyer

### Product Model Updates
- `has_many :chats` - All chats related to this product
- Proper foreign key associations

## Controllers

### ChatsController
**File**: `app/controllers/chats_controller.rb`

Located at `/home/wilson/CSCI3100-Project-Forked/app/controllers/chats_controller.rb`

**Endpoints:**

1. **GET /chats** - List all chats for current user
   - Returns chats where user is seller or buyer
   - Sorted by most recent first
   - Returns formatted chat data with product and user info

2. **GET /chats/:id** - Get specific chat with all messages
   - Includes message history
   - Only accessible to users in the chat
   - Returns full chat data with messages

3. **POST /chats** - Create new chat
   - Required params: `product_id`
   - Automatically sets seller from product
   - Sets buyer as current_user
   - Prevents duplicate chats
   - Returns 409 if user tries to chat with themselves

**Chat Format:**
```json
{
  "id": 1,
  "product": {
    "id": 1,
    "name": "Product Name",
    "price": 100.00,
    "image": "url"
  },
  "seller": {
    "id": 2,
    "name": "Seller Name",
    "profile_picture": "url"
  },
  "buyer": {
    "id": 3,
    "name": "Buyer Name",
    "profile_picture": "url"
  },
  "last_message": "Latest message text",
  "last_message_at": "2026-03-19T...",
  "created_at": "2026-03-19T...",
  "updated_at": "2026-03-19T..."
}
```

### MessagesController
**File**: `app/controllers/messages_controller.rb`

Located at `/home/wilson/CSCI3100-Project-Forked/app/controllers/messages_controller.rb`

**Endpoints:**

1. **GET /chats/:chat_id/messages** - List all messages in a chat
   - Ordered by creation time (oldest first)
   - Only accessible to users in the chat

2. **GET /chats/:chat_id/messages/:id** - Get specific message
   - Only accessible to users in the chat

3. **POST /chats/:chat_id/messages** - Send a message
   - Required body: `{ message: "text content" }`
   - Automatically sets sender_id to current_user
   - Only accessible to users in the chat

4. **DELETE /chats/:chat_id/messages/:id** - Delete a message
   - Only message participants can delete
   - Only accessible to users in the chat

**Message Format:**
```json
{
  "id": 1,
  "chat_id": 1,
  "message": "Hello, interested in this product!",
  "sender": {
    "id": 3,
    "name": "Buyer Name",
    "profile_picture": "url"
  },
  "created_at": "2026-03-19T...",
  "updated_at": "2026-03-19T..."
}
```

## Authentication & Authorization

All endpoints require:
- User to be logged in (stored in `session[:user_id]`)
- User to be part of the chat (either seller or buyer)

**Authorization Checks:**
- Cannot create chat with yourself
- Cannot access chats you're not part of
- Cannot create messages in chats you're not part of
- Cannot delete others' messages

## Routes
```ruby
resources :chats, only: [:index, :show, :create] do
  resources :messages, only: [:index, :create, :show, :destroy]
end
```

## Migration
**File**: `db/migrate/20260319_add_sender_to_messages.rb`

Adds `sender_id` column to messages table and creates foreign key to users table.

## Usage Examples

### Create a Chat
```bash
POST /chats
Body: { "product_id": 1 }
```

### Send a Message
```bash
POST /chats/1/messages
Body: { "message": "Hello, is this still available?" }
```

### Get All Chats
```bash
GET /chats
```

### Get Chat with Messages
```bash
GET /chats/1
```

### Get Messages from Chat
```bash
GET /chats/1/messages
```

### Delete a Message
```bash
DELETE /chats/1/messages/1
```

## Error Handling

Common HTTP Status Codes:
- `200 OK` - Successful GET/UPDATE
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - User not logged in
- `403 Forbidden` - User doesn't have access
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation failed

## Future Enhancements

**Real-time Messaging** - Integrate ActionCable for live message updates

