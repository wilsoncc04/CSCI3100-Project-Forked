# Community Unit Test Cases

This document describes the manual and automated test cases for the Community Unit.

## 1. Promotion during Product Listing
**Description:** Ensure a user can promote a product to their college community while creating a new product listing.

| Test ID | Step | Expected Result |
|---------|------|-----------------|
| COM-01  | Log in to the application. | Successful login. |
| COM-02  | Navigate to "Sell" page. | Sell form is displayed. |
| COM-03  | Fill in product details (Name, Price, etc.). | Fields are filled correctly. |
| COM-04  | Check "Promote to College Community Board". | Description textarea appears. |
| COM-05  | Enter advertisement description and click "Post Product". | Product is created and success message appears. |
| COM-06  | Check `community_items` table in database. | A new record exists linked to the product. |

## 2. Community Board Display & Filtering
**Description:** Ensure advertisements are correctly displayed and filtered by college.

| Test ID | Step | Expected Result |
|---------|------|-----------------|
| COM-07  | Navigate to "Community" page. | List of recent community posts is shown. |
| COM-08  | Click on "Chung Chi College" filter. | Only posts from Chung Chi College are visible. |
| COM-09  | Verify Product Card details. | Correct price, name, and image are shown for the promoted product. |
| COM-10  | Click on the product card. | Redirects to the product info page. |

## 3. Security & Validations (Backend)
**Description:** Ensure data integrity and authorization.

| Test ID | Step | Expected Result |
|---------|------|-----------------|
| COM-11  | Attempt to create CommunityItem for someone else's product via API. | Returns `403 Forbidden` or validation error. |
| COM-12  | Create CommunityItem without description. | Returns `422 Unprocessable Entity`. |
| COM-13  | Delete a product with a community promotion. | The corresponding community item is also deleted (dependent: :destroy). |

## 4. Automated Tests
- **RSpec (Model):** `spec/models/community_item_spec.rb` (Tests validations and associations)
- **RSpec (Request):** `spec/requests/community_items_spec.rb` (Tests API endpoints and authentication)
- **Cucumber:** `features/community.feature` (Tests the full user flow from listing to board viewing)
