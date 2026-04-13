# Users API - Test Cases

## GET /users
- when requester is admin
  - returns all users
  - returns users with correct attributes
- when no users exist
  - returns an empty array
- when requester is authenticated but not admin
  - returns forbidden
- when requester is unauthenticated
  - returns unauthorized

## GET /users/admins
- when requester is admin
  - returns only admin users
  - validates admin response schema
- when requester is authenticated but not admin
  - returns forbidden
- when requester is unauthenticated
  - returns unauthorized

## GET /users/:id
- when requester is admin and user exists
  - returns the user details
  - returns user with all public attributes
  - does not expose sensitive information
- when requester is admin and user does not exist
  - returns 404 error
- when requester is authenticated but not admin
  - returns forbidden
- when requester is unauthenticated
  - returns unauthorized

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

## POST /users/forgot_password
- with verified user email
  - sends password reset OTP email
  - generates new OTP
  - returns generic success message
- with unverified user email
  - does not send password reset OTP email
  - returns generic success message
- with invalid or missing email
  - returns generic success message to prevent account enumeration

## POST /users/reset_password
- with valid OTP
  - resets password
  - clears OTP fields
  - returns success message
- with invalid OTP
  - returns unprocessable content
  - does not change password
- with expired OTP
  - returns unprocessable content
- with missing required fields
  - returns bad request for missing email
  - returns bad request for missing otp
  - returns bad request for missing new_password
- with invalid account state
  - fails for non-existent email
  - fails for unverified user

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
- allows unauthenticated access to forgot_password action
- allows unauthenticated access to reset_password action
- requires authentication for index action
- requires authentication for admins action
- requires authentication for show action
- requires authentication for interests action
- requires authentication for update action
- requires authentication for destroy action
- requires authentication for change_password action
