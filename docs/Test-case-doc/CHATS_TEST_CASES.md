# Chats API - Test Cases

## GET /chats (index)
- Authenticated user with no chats returns an empty array.
- Authenticated buyer receives all buyer-side chats.
- Authenticated seller receives all seller-side chats.
- Results include expected fields (`id`, `product`, `seller`, `buyer`, `last_message`, `last_message_at`, timestamps).
- Product and user payloads are validated for expected public attributes.
- Chats are ordered by most recent `updated_at` descending.
- Unauthenticated access returns `401` with `unauthenticated` error.

## GET /chats/:id (show)
- Chat participant (buyer or seller) can fetch chat details.
- Response includes chat metadata plus all messages.
- Message payload fields are validated (`id`, `chat_id`, `message`, `sender`, timestamps).
- Non-participants are blocked with `403`.
- Unknown chat ID returns `404` with `Chat not found`.

## POST /chats (create)
- Buyer can create a new chat for a product and receives `201`.
- Response includes expected chat data and correct seller/buyer/product mapping.
- If chat already exists for the same product + seller + buyer, response is `200` and reuses existing chat.
- Seller cannot create chat with own product (`422`, `Cannot chat with yourself`).
- Missing or invalid `product_id` returns `404` (`Product not found`).
- Validation failure branch is covered (`422` with errors payload).

## Data Exposure Checks
- Seller and buyer payloads do not expose sensitive fields like `password_digest` and `verification_otp`.
- Chat responses include expected contact fields (`email`, `name`, `profile_picture_url`) used by frontend chat UI.
