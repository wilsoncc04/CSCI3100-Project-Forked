# Image Management System

This document describes the image management implementation for user profile pictures and product images in the CSCI3100 marketplace application.

## Overview

The application uses **Rails Active Storage** for managing image uploads, with support for both local disk storage (development/test) and Cloudinary (production).

### Storage Configuration
- **Development/Test**: Local disk (`storage/` directory)
- **Production**: Cloudinary (configured via `config/storage.yml`)

## Implementation Details

### 1. Database Models

#### User Model
- **Association**: `has_one_attached :profile_picture`
- **Type**: Single image attachment
- **Purpose**: Store user profile picture

```ruby
# app/models/user.rb
has_one_attached :profile_picture
```

#### Product Model
- **Association**: `has_many_attached :image`
- **Type**: Multiple image attachments
- **Purpose**: Store product images (gallery)

```ruby
# app/models/product.rb
has_many_attached :image
```

### 2. Controller Implementation

#### Users Controller - Profile Picture Upload

**File**: `app/controllers/users_controller.rb`

##### Update Action (PATCH /users/:id)
```ruby
def update
  # Handle profile picture upload
  if params[:profile_picture].present?
    @user.profile_picture.purge if @user.profile_picture.attached?
    @user.profile_picture.attach(params[:profile_picture]) if params[:profile_picture].is_a?(ActionDispatch::Http::UploadedFile)
  end

  if @user.update(user_params)
    render json: format_user(@user), status: :ok
  else
    render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
  end
end
```

**Key Features**:
- Accepts `profile_picture` parameter
- Validates file is an ActionDispatch::Http::UploadedFile
- Automatically replaces existing image (calls `purge`)
- Returns user with profile_picture_url in response

##### Response Format
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "1155123456@link.cuhk.edu.hk",
  "profile_picture_url": "/rails/active_storage/blobs/..."
}
```

#### Products Controller - Product Images Upload

**File**: `app/controllers/products_controller.rb`

##### Create Action (POST /products)
```ruby
def create
  product = Product.new(product_params)
  
  # Handle image uploads
  if params[:images].present?
    params[:images].each do |image|
      product.image.attach(image) if image.is_a?(ActionDispatch::Http::UploadedFile)
    end
  end
  
  if product.save
    render json: format_product(product), status: :created
  else
    render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
  end
rescue StandardError => e
  render_error(e)
end
```

##### Update Action (PATCH /products/:id)
```ruby
def update
  # Replace images if new ones provided
  if params[:images].present?
    @product.image.purge_all # Remove old images
    params[:images].each do |image|
      @product.image.attach(image) if image.is_a?(ActionDispatch::Http::UploadedFile)
    end
  end

  if @product.update(product_params)
    render json: format_product(@product), status: :ok
  else
    render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
  end
rescue StandardError => e
  render_error(e)
end
```

**Key Features**:
- Accepts `images` parameter (array)
- Validates each file is an ActionDispatch::Http::UploadedFile
- Replaces all images when new ones provided (calls `purge_all`)
- Returns product with image URLs array in response

##### Response Format
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 100.0,
  "images": [
    "/rails/active_storage/blobs/...",
    "/rails/active_storage/blobs/..."
  ]
}
```

## API Usage

### Upload User Profile Picture
```bash
curl -X PATCH http://localhost:3000/users/1155123456 \
  -F "profile_picture=@/path/to/image.jpg"
```

### Upload Product Images
```bash
curl -X POST http://localhost:3000/products \
  -F "product[name]=Product Name" \
  -F "product[price]=100" \
  -F "product[seller_id]=1" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Update Product Images
```bash
curl -X PATCH http://localhost:3000/products/1 \
  -F "images=@/path/to/new_image.jpg"
```

## Testing

### Test Cases Added

#### User Profile Picture Tests (`spec/requests/users_spec.rb`)
- ✅ Uploads profile picture successfully
- ✅ Attaches image to user model
- ✅ Replaces existing profile picture
- ✅ Returns profile picture URL in response
- ✅ Updates both picture and other attributes
- ✅ Handles nil profile picture gracefully
- ✅ Returns nil profile_picture_url when no image attached

#### Product Image Tests (`spec/requests/products_spec.rb`)
- ✅ Creates product with single image
- ✅ Creates product with multiple images
- ✅ Creates product without images
- ✅ Replaces images on update
- ✅ Keeps existing images when not updating
- ✅ Updates both attributes and images
- ✅ Returns valid image URLs
- ✅ Handles file upload errors gracefully

### Running Tests

```bash
# Run all tests
bundle exec rspec

# Run user controller tests
bundle exec rspec spec/requests/users_spec.rb

# Run product controller tests
bundle exec rspec spec/requests/products_spec.rb

# Run specific test
bundle exec rspec spec/requests/users_spec.rb -e "uploads profile picture"
```

## Security Considerations

### File Validation
- Only ActionDispatch::Http::UploadedFile objects are accepted
- Other file types (strings, hashes) are silently ignored
- File type validation should be added at Active Storage level if needed

### Recommended Enhancements
```ruby
# Add to models to validate file types
validates :profile_picture, blob: { content_type: 'image/jpeg', size_range: 1..5.megabytes }
validates :image, blob: { content_type: ['image/jpeg', 'image/png'], size_range: 1..10.megabytes }
```

### Access Control
- Profile picture updates require user authentication
- Ensure only authorized users can update their own pictures
- Product image updates should have seller authorization

## Storage Configuration

### Local Storage (Development/Test)
```yaml
# config/storage.yml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>
```

### Cloudinary Storage (Production)
```yaml
cloudinary:
  service: Cloudinary
  cloud_name: <%= Rails.application.credentials.dig(:cloudinary, :cloud_name) %>
  api_key: <%= Rails.application.credentials.dig(:cloudinary, :api_key) %>
  api_secret: <%= Rails.application.credentials.dig(:cloudinary, :api_secret) %>
  secure: true
```

### Set Rails Environment
```bash
# Set active storage service in config/environments/production.rb
config.active_storage.service = :cloudinary
```

## Troubleshooting

### Image Not Uploading
- Check file parameter name matches controller (profile_picture or images)
- Verify file is multipart form-data
- Ensure file is an actual file object, not string

### URL Not Accessible
- Verify Active Storage gem version compatibility
- Check storage service is properly configured
- For Cloudinary, verify API credentials are set

### Tests Failing
- Ensure Tempfile is required in test file
- Verify Rack::Test::UploadedFile is available
- Check ActionDispatch is properly loaded

## Future Enhancements

1. **Image Resizing**: Add image optimization for thumbnails
2. **Virus Scanning**: Integrate antivirus scanning for uploads
3. **Image Verification**: Add MIME type validation
4. **CDN Integration**: Add CDN for faster image delivery
5. **Image Compression**: Automatically compress large images
6. **Metadata Extraction**: Extract EXIF data for security
