# Messages API - Test Cases

## GET /chats/:chat_id/messages (index)
- as buyer (chat participant)
  - with no messages
    - returns an empty array
  - with messages
    - returns all messages in the chat
    - returns messages with correct attributes (id, chat_id, message, sender, created_at, updated_at)
    - returns messages in chronological order (oldest first)
    - includes sender information
- as seller (chat participant)
  - returns all messages in the chat
  - returns messages with correct attributes
- as non-participant
  - returns forbidden error
  - does not expose chat messages
- authentication
  - requires authentication to view messages

## GET /chats/:chat_id/messages/:id (show)
- as buyer (chat participant)
  - returns message with correct attributes
  - returns message details with all fields
- as seller (chat participant)
  - returns message with correct attributes
- as non-participant
  - returns forbidden error
- when message does not exist
  - returns 404 error
- authentication
  - requires authentication

## POST /chats/:chat_id/messages (create)
- with valid message
  - creates a new message successfully
  - returns created status
  - returns message with all attributes
  - associates message with correct chat
  - records sender correctly
  - message is accessible in chat
- with empty message
  - returns unprocessable entity error
  - message is not created
- with missing message parameter
  - returns bad request error
  - message is not created
- as non-participant
  - returns forbidden error
  - message cannot be created in chat by non-participant
- authentication
  - requires authentication to create message

## Message Formatting
- returns message with sender information
- returns message with timestamps (created_at, updated_at)
- returns message text content
- returns associated chat_id

## Message Content Validation
- rejects empty message content
- rejects messages with only whitespace
- accepts messages with special characters
- accepts messages with emojis
- handles long message content (within reasonable limits)

## Error Handling
- handles missing chat_id gracefully
- handles invalid chat_id format
- handles non-existent chat gracefully
- handles malformed request data

## Authentication and Authorization
- GET /chats/:chat_id/messages (index)
  - requires authentication
  - only allows chat participants to view messages
  - prevents non-participants from accessing messages
- GET /chats/:chat_id/messages/:id (show)
  - requires authentication
  - only allows chat participants to view
- POST /chats/:chat_id/messages (create)
  - requires authentication
  - only allows chat participants to send messages
  - prevents non-participants from sending messages
