# CSCI3100 Project

A web marketplace project built with Rails and React.

## Features

### CUHK Second-hand Marketplace SaaS
A marketplace platform for CUHK students to exchange products with verified identities and localized logistics.

**Core Features:**
- **Verified Student Community**: Registration requires University ID and hostel information to ensure a safe, scam-protected environment for CUHK members.
- **Localized Promotions**: The community page allow the college students to promote their products to their college, such that additional features, favorable and advertisement can be displayed to the college.
- **Real-time Communication**: Integrated online chatting and community promotions for seamless buyer-seller interaction.

**Advanced Features:**
1. **Fuzzy Search**: Robust search functionality that accounts for typos and vague descriptions to help users find products by similar meaning.
2. **Real-time Notifications**: Instant alerts for sellers when a buyer expresses interest or clicks 'Buy', accelerating the transaction process.
3. **Price & Market Analytics (Chart.js)**: 
    - **Market Statistics**: Visualizes product category distributions.
    - **Price History**: Tracks price changes over time for similar items to inform buyer and seller decisions.

## Tech Stack

- Ruby on Rails 8
- SQLite (development)
- React + esbuild
- RSpec + Cucumber

## Quick Start

1. Install dependencies.

```bash
bundle install
npm install
```

2. Set up database.

```bash
bin/rails db:create db:migrate db:seed
```

3. Start development server.

```bash
bin/dev
```

4. Open http://localhost:3000

## Run Tests

```bash
bundle exec rspec
bundle exec cucumber
```

## Feature Ownership

| Feature Name | Primary Developer (Name) | Secondary Developer (Name) | Notes |
|---|---|---|---|
| User Auth and Roles | Chau Wing Fun(wilsoncc04) | [Name] | [Example: Devise and authorization rules] |
| Database Management | [Name] | [Name] | [Short note] |
| Product Listing and Detail | [Name] | [Name] | [Short note] |
| Selling Workflow | [Name] | [Name] | [Short note] |
| Search and Filter | [Name] | [Name] | [Short note] |
| Purchase History | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Community | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Image Management | [Name] | [Name] | [Short note] |
| RSpec Testing | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| User Management | Chau Wing Fun(wilsoncc04) | [Name] | Include: Admin, user, login/register management |
| Platform management | [Name] | [Name] | [Short note] |
| [Template] | [Name] | [Name] | [Short note] |
| Chart.js | [Name] | [Name] | [Short note] |
| Chat | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Cucumber Testing | [Name] | [Name] | [Short note] |

