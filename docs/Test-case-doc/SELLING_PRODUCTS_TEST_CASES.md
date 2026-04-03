# Selling Products API - Test Cases

## GET /products/selling
- when user is authenticated
  - returns status code 200
  - returns only the products belonging to the current user
  - includes product details (name, price, etc.)
  - correctly handles products with or without images
- when user is not authenticated
  - returns status code 401 (for JSON requests)
  - returns status code 302 redirect to root (for non-JSON requests)

## POST /products (create)
- without images
  - creates product successfully
  - returns empty images array in response
  - records initial price history record

## PATCH /products/:id (update)
- without images in params
  - keeps existing images if `images` parameter is not provided
  - does not update images when only updating text fields
- with empty images array
  - removes all existing images from the product
  - returns 200 OK with empty images array
