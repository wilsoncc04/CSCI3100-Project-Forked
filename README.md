# CSCI3100 Project

A web marketplace project built with Rails and React.

## Features

### CUHK Second-hand Marketplace SaaS
A marketplace platform for CUHK students to exchange products with verified identities and localized logistics.

**Core Features:**
- **Verified Student Community**: Registration requires University ID and hostel information to ensure a safe, scam-protected environment for CUHK members.
- **Localized Promotions**: The community page allow the college students to promote their products to their college, such that additional features, favorable and advertisement can be displayed to the college.
- **Real-time Communication**: Integrated online chatting and community promotions for seamless buyer-seller interaction.
- **Admin Moderation & Operations**:
    - View all registered users in the admin dashboard (`GET /users`).
    - View all admin accounts (`GET /users/admins`).
    - View any user's profile by CUHK ID for support and moderation (`GET /users/:id`).
    - Manually delete any product listing from the frontend when moderation is needed (admin can delete all users' products).

**Advanced Features:**
1. **Fuzzy Search**: Robust search functionality that accounts for typos and vague descriptions to help users find products by similar meaning.
2. **Real-time Notifications**: Instant alerts for sellers when a buyer expresses interest or clicks 'Buy', accelerating the transaction process.
3. **Price & Market Analytics (Chart.js)**: 
    - **Market Statistics**: Visualizes product category distributions.
    - **Price History**: Tracks price changes over time for similar items to inform buyer and seller decisions.

## Tech Stack

- Ruby on Rails 8
- PostgreSQL (development & production)
- React + esbuild
- RSpec + Cucumber

## Quick Start

1. Install system dependencies (Ubuntu/WSL).
```bash
sudo apt update
sudo apt install -y libpq-dev postgresql postgresql-contrib
```

2. Install Ruby and JS dependencies.

```bash
bundle install
npm install
```

3. Set up database.

```bash
# Ensure PostgreSQL is running
sudo service postgresql start
bin/rails db:create db:migrate db:seed
```

4. Start development server.

```bash
bin/dev
```

5. Open http://localhost:3000

## Run Tests

### RSpec
```bash
bundle exec rspec
```

### Cucumber
Cucumber tests require **Google Chrome** and **Chromedriver**.
1. Install Chromedriver using the provided script:
```bash
chmod +x installchromedriver.bash
sudo ./installchromedriver.bash
```
2. Run tests:
```bash
bundle exec cucumber
```

## Feature Ownership

| Feature Name | Primary Developer (Name) | Secondary Developer (Name) | Notes |
|---|---|---|---|
| User Management | Chau Wing Fun(wilsoncc04) | [Name] | Include: Admin, user, login/register management |
| Heroku Implementations | [Name] | [Name] | [Short note] |
| Backend Controllers | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Database Management | [Name] | [Name] | [Short note] |
| Search and Filter | [Name] | [Name] | [Short note] |
| Purchase History | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Community | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Image Management | [Name] | [Name] | [Short note] |
| RSpec Testing | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Platform management | [Name] | [Name] | [Short note] |
| Chart.js | [Name] | [Name] | [Short note] |
| Real-time Notifications | [Name] | [Name] | [Short note] |
| Chat and messages | Chau Wing Fun(wilsoncc04) | [Name] | [Short note] |
| Cucumber Testing | [Name] | [Name] | [Short note] |
| [Template] | [Name] | [Name] | [Short note] |


Testing coverage:
**Testing coverage**

- **RSpec (SimpleCov):** 91.16%

![RSpec coverage](RSpec_testing_coverage.png)