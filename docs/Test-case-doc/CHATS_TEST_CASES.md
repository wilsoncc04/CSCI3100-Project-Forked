# Chats API - Test Cases

## GET /chats (index)
- when user is authenticated
  - with no chats
    - returns an empty array
  - with chats as buyer
    - returns all chats where user is buyer
    - returns chats with correct attributes (id, product, seller, buyer, last_message, etc.)
    - formats product data correctly
    - formats seller data correctly
    - formats buyer data correctly
    - returns chats sorted by most recent first (descending updated_at)
  - with chats as seller
    - returns all chats where user is seller
    - returns chats with correct attributes
    - returns chats sorted by most recent first
- when user is not authenticated
  - requires authentication

## POST /chats (create)
- when buyer initiates chat on seller's product
  - creates a new chat successfully
  - returns created status with chat data
  - returns chat with all required attributes
  - returns first message with chat creation
  - associates chat with correct product
  - associates chat with correct seller and buyer
- when seller initiates chat
  - chat is created from seller perspective
- when chat already exists
  - prevents duplicate chat creation
  - returns existing chat instead of creating new one
- when seller tries to chat with themselves
  - returns unprocessable entity error (Cannot chat with yourself)
- with invalid parameters
  - fails with missing product_id
  - fails with missing message
  - fails with empty message
- authentication
  - requires authentication to create chat

## GET /chats/:id (show)
- when requesting own chat
  - returns chat details
  - returns all chat attributes
  - returns formatted product, seller, and buyer data
- when requesting chat of another user
  - returns forbidden error
- when chat does not exist
  - returns 404 error
- authentication
  - requires authentication

## PATCH /chats/:id (update)
- when updating own chat
  - updates chat attributes
  - returns updated chat data
- when updating chat of another user
  - returns forbidden error
- authentication
  - requires authentication

## DELETE /chats/:id (delete)
- when deleting own chat
  - deletes the chat successfully
  - returns no content status
- when deleting chat of another user
  - returns forbidden error
  - does not delete the chat
- when chat does not exist
  - returns 404 error
- authentication
  - requires authentication

## Authentication and Authorization
- GET /chats (index)
  - allows only authenticated users
  - only returns chats where user is participant
- POST /chats (create)
  - requires authentication
  - only allows user to create chat as themselves
- GET /chats/:id (show)
  - requires authentication
  - only allows viewing own chats
- PATCH /chats/:id (update)
  - requires authentication
  - only allows updating own chats
- DELETE /chats/:id (delete)
  - requires authentication
  - only allows deleting own chats

## Chat Formatting and Data
- returns chat with formatted product information
- returns chat with seller profile data (excluding sensitive info)
- returns chat with buyer profile data (excluding sensitive info)
- includes last message in chat response
- includes last message timestamp (last_message_at)
