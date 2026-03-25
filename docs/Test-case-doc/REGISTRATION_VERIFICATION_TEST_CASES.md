# Registration and Verification - Test Cases

## Complete Registration and Verification Flow
- end-to-end user registration and verification
  - registers a user with valid parameters
  - user is created in database
  - verification OTP is generated
  - verification email is sent
  - returns created status (201)
  - user is not verified immediately
  - verification OTP is present in response/database
  - verification email contains OTP or verification link

## User Registration (POST /users or POST /users/register)
- with valid parameters
  - creates a new user account
  - user is created in database
  - returns created status
  - returns user data without sensitive info
  - generates verification OTP
  - sends verification email asynchronously
  - user is not verified immediately (verified_at is nil)
  - returns user object with all public attributes
  - does not expose password or OTP in response
- with invalid parameters
  - fails with invalid email format (non-@link.cuhk.edu.hk domain)
  - returns unprocessable entity error
  - fails with missing password
  - fails with missing name
  - fails with duplicate email
  - fails with missing required fields
- email validation
  - requires @link.cuhk.edu.hk email domain
  - rejects non-CUHK email addresses
  - validates email format
  - ensures email is properly formatted
- password validation
  - requires password to meet minimum requirements
  - accepts securely hashed passwords
- CUHK ID validation
  - validates CUHK ID format if provided
  - extracts CUHK ID from email if not provided

## Email and OTP Management
- generates unique OTP for each user
- OTP is valid for verification
- OTP is properly stored and retrievable
- generates new OTP on verification resend
- old OTP becomes invalid when new one is generated

## User Verification (POST /users/verify)
- with valid OTP
  - verifies the user account
  - sets verified_at timestamp
  - clears the OTP after verification
  - returns success message 'verified'
  - returns 200 OK status
  - user can now login
- with invalid OTP
  - returns unprocessable entity error
  - does not verify user
  - user remains unverified
  - verification_at remains nil
  - returns error message
- with wrong email and OTP
  - fails verification
  - returns not found or unauthorized error
- with non-existent email
  - returns not found error (prevents account enumeration)
  - does not reveal if account exists
- when OTP expires
  - fails with expired OTP
  - returns unprocessable entity error
  - user must request new OTP
- with missing OTP
  - returns bad request error (400)
  - returns error message 'otp_missing'
  - verification does not proceed

## Verification Email
- is sent asynchronously
- contains OTP or verification link
- is delivered to correct email address
- contains user-friendly instructions
- includes account details (name, email)
- provides resend option link

## OTP Resend (POST /users/resend_verification)
- with valid email
  - resends verification email
  - generates new OTP
  - invalidates old OTP
  - returns generic success message
  - email is sent to user
  - returns 200 OK status
- with invalid email
  - returns generic success message (prevents account enumeration)
  - no email is sent for non-existent account
  - user cannot determine if email exists
- with no email parameter
  - returns generic success message
  - no email is sent
  - prevents abuse via enumeration
- when user is already verified
  - does not resend email for verified user
  - no background job is enqueued
  - returns success message (regardless of verification status)

## Session Integration
- after verification, user can login
  - verified user receives 201 status on login
  - unverified user receives 403 status on login
  - failed verification prevents login

## Error Messages
- provides clear error messages for validation failures
- provides security-conscious error responses
- prevents account enumeration attacks
- does not reveal which accounts exist

## Account State
- newly registered user
  - is_seller: false (by default)
  - verified_at: nil
  - profile_picture: not attached
  - has valid CUHK ID from email
  - seller_rating: 0 (default)
- after verification
  - verified_at: present (timestamp)
  - can access seller features if is_seller: true
  - can login successfully
  - can access protected endpoints

## Data Validation
- Email must be @link.cuhk.edu.hk domain
- Name is required
- Password is required and securely stored
- All required fields validated
- Duplicate email prevention
