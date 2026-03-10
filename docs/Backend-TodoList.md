# Backend TODO List

Purpose: concise backend development checklist and priorities. See [Proposal.md](Proposal.md) for higher-level decisions.

## Table of contents
- Models
- Controllers
- Auth & Registration
- CUHK email verification (Solution 1)
- Front-end sitemap

---

## Models

- **User**
  - Secure credentials: store hashed passwords (bcrypt/Devise). Consider 2FA later.
  - Associations: purchase history, cart, saved items, sell records.
  - Settings: JSONB for flexible preferences.

- **Product**
  - Fuzzy search: use PostgreSQL `pg_trgm` or a search engine (Elasticsearch/Meili).
  - Price history: store time-series prices to render charts (Chart.js on frontend).
  - Metadata: categories, tags, seller reference.

- **ChatLog / Messages**
  - Store sender_id, receiver_id, message body, timestamps; index for fast lookup.

## Controllers / API responsibilities

- **UsersController**
  - Profile endpoints, account settings, purchase/sell history, inbox notifications.

- **ProductsController**
  - Search (fuzzy), filtering, sorting, product details, price-history endpoint.

- **ChatsController / MessagesController**
  - CRUD for messages, conversation endpoints, unread counts, realtime via Action Cable.

- **Sessions / Auth**
  - Login, logout, registration, email verification flows, rate-limiting.

## Auth & Registration

- Recommended: Solution 1 — CUHK email verification - **1155XXXXXX@link.cuhk.edu.hk**(preferred for integrity).
- Not recommended: Offline tokens for registration (security & user experience concerns).

Notes:
- Use Devise or `has_secure_password` + custom verification depending on complexity.
- Protect endpoints with authentication and authorization (Pundit / Cancancan / custom policies).

## Solution 1 — CUHK email verification

- Requirements:
  - Mailer setup (SMTP) and templated verification emails.
  - Background job processor for sending emails (Active Job + Sidekiq/Resque).
  - Token-based verification links with expiration.

## Front-end sitemap (initial)

- index
  - search page
  - inbox* (requires login)
  - notifications* (evaluate necessity)
  - chat
  - Profile* (requires login)
    - Account
    - Cart
    - Interest list
    - Purchase history
    - Sell records
    - Seller product list

---

Next steps:
- Prioritize models and API endpoints; implement authentication & mailer first.
- Prototype product search (pg_trgm) and price-history schema.
