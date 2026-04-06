# Users API - Test Cases

## GET /users
- when listing all users
  - returns all users
  - returns users with correct attributes
- when no users exist
  - returns an empty array

## GET /users/admins
- returns only admin users
- validates admin response schema when data exists

## GET /users/:id
- when user exists
  - returns the user details
  - returns user with all public attributes
  - does not expose sensitive information
- when user does not exist
  - returns 404 error

## POST /users (create/register)
- with valid parameters
  - creates a new user
  - returns created status
  - returns user data without sensitive info
  - generates verification OTP
  - sends verification email (synchronous delivery)
  - does not verify user immediately
- with invalid parameters
  - fails with invalid email format
  - fails with missing password
  - fails with duplicate email
  - fails with missing required fields

## POST /users/verify
- with valid OTP
  - verifies the user
  - clears the OTP after verification
  - returns success message
- with invalid OTP
  - fails with incorrect OTP
  - fails with missing OTP
  - fails with non-existent email
- when OTP expires
  - fails with expired OTP

## POST /users/resend_verification
- with valid email
  - resends verification email
  - generates new OTP
  - returns generic success message
- with invalid email
  - returns generic success message to prevent account enumeration
- with no email
  - returns generic success message
- when user is already verified
  - does not resend email for verified user

## POST /users/change_password
- with authentication
  - changes the password
  - returns success message
  - fails to change password (invalid current password)
  - does not change the password (invalid current password)
  - returns unauthorized for non-existent user email
- without authentication
  - requires authentication

## GET /users/interests
- with authentication
  - returns current user's interested products
  - returns empty array when no interests exist
- without authentication
  - returns unauthorized error

## PATCH /users/:id
- when authenticated
  - updates the user
  - returns updated user data
  - fails with invalid email format
- when not authenticated
  - requires authentication
- when updating non-existent user
  - returns 404

## DELETE /users/:id
- when authenticated
  - deletes the user
  - does not delete other users
- when not authenticated
  - requires authentication
- when deleting non-existent user
  - returns 404

## Authentication checks
- allows unauthenticated access to create action
- allows unauthenticated access to verify action
- allows unauthenticated access to index action
- allows unauthenticated access to show action
- requires authentication for interests action
- requires authentication for update action
- requires authentication for destroy action
- requires authentication for change_password action
