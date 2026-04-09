# Products API - Test Cases

## POST /products (create with image)
- with single image upload
  - creates product with image successfully
  - attaches image to product
  - returns created status with image URL
  - creates price history record when product is created
- with multiple images upload
  - attaches multiple images to product
  - returns all image URLs in response
  - records price history for multiple image uploads
- without images
  - creates product without images
  - returns empty images array
  - creates price history record even without images
- with community promotion
  - creates community item when promote_to_community is true
  - does not create community item when promote_to_community is false
- with invalid parameters
  - fails with missing required fields
  - ignores non-UploadedFile objects in images

## PATCH /products/:id (update with image)
- with single image replacement
  - replaces all existing images
  - returns updated product with new image URL
  - does not create price history when only images are replaced
- with multiple image replacement
  - replaces images with multiple new images
  - records price history when updating multiple prices
- without new images
  - keeps existing images when no new images provided
  - does not create price history when updating non-price attributes
- with other attribute updates and images
  - updates both attributes and images
  - creates price history record when price is updated
- with community promotion updates
  - creates community item when update enables promotion
  - removes existing community item when promotion is disabled

## Price History Tracking
- Product creation
  - creates initial price history record on product creation
  - records correct price value in history
  - records creation timestamp
- Product price updates
  - creates new price history record when price is changed
  - maintains chronological order of price changes
  - tracks multiple price updates over time
- Non-price updates
  - does not create price history for non-price attribute changes
  - preserves existing price history when updating other attributes

## GET /products (index)
- with products containing images
  - lists products
  - returns paginated product data
- pagination
  - returns first page with default limit (15)
  - returns second page with custom limit
  - returns last page with remaining items
  - handles invalid page numbers gracefully
  - handles invalid limit gracefully
  - returns correct pagination data for custom limit
- fuzzy search with pagination
  - searches products by keywords (fuzzy matching)
  - finds products with similar names (trigram matching)
  - applies pagination to search results
  - returns correct total count for filtered results
  - returns empty results when no matches found
- type and seller filters
  - filters products by category type
  - filters products by seller college
  - filters products by hall parameter mapped to seller hostel
  - returns all products when fetch_all is true

## GET /products/:id (show)
- with product containing images
  - returns product details
  - returns image URL list in response
- ownership and interest state
  - returns `is_owner` true for product seller
  - returns `is_liked` true for users who liked the product
- community promotion state
  - returns `promote_to_community` and `community_description` when promoted
- error handling
  - returns not found for unknown product ID

## GET /products/price_history
- successful requests
  - returns price history for a product by product_id
  - returns price history with default points (10)
  - accepts custom points parameter
  - allows unauthenticated access
  - allows authenticated access
  - returns numeric `prices` values from `PriceHistory`
  - returns category average history when product category has historical prices
- points parameter validation
  - limits points to maximum 20
  - handles zero and negative points gracefully
- query parameters
  - accepts product_id as query parameter
  - accepts id as query parameter (fallback to product_id)
  - prioritizes product_id parameter over id parameter
- error handling
  - returns bad request when product_id is missing
  - returns not found when product does not exist

## POST /products/:id/interest
- requires authentication
- authenticated user can like a product (creates `Interest`, returns `liked`)
- authenticated user can unlike a product by toggling again (deletes `Interest`, returns `unliked`)

## POST /products/:id/buy
- requires authentication
- authenticated buyer can reserve product successfully
- updates product status to `reserved` and sets `buyer_id`
- creates chat and initial system message for first purchase request
- reuses existing chat when buyer already has chat for the product
- blocks seller from buying their own product (`cannot_buy_own_product`)
- blocks buying unavailable products in `reserved`/`sold` state (`product_unavailable`)

## DELETE /products/:id
- deletes product and its images

## Image URL formatting
- returns valid image URLs in format_product response
- returns valid image URLs in response body
- handles empty/null image URLs appropriately

## Error handling
- handles file upload errors gracefully

## Authentication and Authorization checks
- POST /products (create)
  - requires authentication
  - allows authenticated user to create product
- PATCH /products/:id (update)
  - requires authentication
  - allows seller to update their own product
  - prevents other sellers from updating product
  - prevents buyer from updating product
- DELETE /products/:id (destroy)
  - requires authentication
  - allows seller to delete their own product
  - prevents other sellers from deleting product
  - prevents buyer from deleting product
- GET /products/:id (show)
  - allows unauthenticated access
  - allows authenticated access
- GET /products (index)
  - allows unauthenticated access
