# Products API - Test Cases

## POST /products (create with image)
- with single image upload
  - creates product with image successfully
  - attaches image to product
  - returns created status with image URL
- with multiple images upload
  - attaches multiple images to product
  - returns all image URLs in response
- without images
  - creates product without images
  - returns empty images array
- with invalid parameters
  - fails with missing required fields
  - ignores non-UploadedFile objects in images

## PATCH /products/:id (update with image)
- with single image replacement
  - replaces all existing images
  - returns updated product with new image URL
- with multiple image replacement
  - replaces images with multiple new images
- without new images
  - keeps existing images when no new images provided
- with other attribute updates and images
  - updates both attributes and images

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

## GET /products/:id (show)
- with product containing images
  - returns product details

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
