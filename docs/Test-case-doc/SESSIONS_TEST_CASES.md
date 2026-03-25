# Sessions API - Test Cases

## POST /sessions (login)
- when credentials are valid and user is verified
  - returns success with user data
  - returns correct status (created/201)
  - returns user data without sensitive information
  - returns user with correct attributes (id, email, name, cuhk_id, hostel, is_seller)
  - returns message 'logged_in'
  - does not expose sensitive information (password_digest, verification_otp, verification_sent_at)
  - sets session cookie for authentication
  - returns user profile data (profile_picture_url, etc.)
- when user is verified
  - allows login with verified account
  - establishes authenticated session
- when user is not verified
  - returns forbidden error (403)
  - returns error message 'email_not_verified'
  - does not create session
  - does not set authentication cookie
- when password is incorrect
  - returns unauthorized error (401)
  - returns error message 'invalid_credentials'
  - does not create session
- when email does not exist
  - returns unauthorized error (401)
  - returns error message 'invalid_credentials'
  - does not reveal whether email exists (security)
- when email or password is missing
  - returns unauthorized error when email is missing
  - returns unauthorized error when password is missing
  - does not create session
- with case-insensitive email matching
  - accepts email in different cases
  - correctly validates credentials regardless of case
- authentication
  - does not require authentication to login
  - allows unauthenticated users to access login endpoint
  - allows previously logged-in users to login again

## DELETE /sessions/:id (logout)
- logout functionality
  - returns no content status (204)
  - returns empty response body
  - clears session cookie
  - invalidates authentication token
- authentication effects
  - user loses authentication after logout
  - subsequent requests without login are rejected
  - session becomes invalid

## Session Management
- after successful login
  - user can access protected endpoints
  - user can make authenticated requests
  - session persists across requests
- after logout
  - user cannot access protected endpoints
  - subsequent requests return unauthorized
  - session is properly cleaned up

## Response Format
- login response includes
  - status code (201)
  - user object with public attributes
  - message field indicating success
  - no sensitive fields in response
- logout response
  - has no content body
  - has empty response text

## Error messages
- returns appropriate error messages for failed login
- distinguishes between auth and verification errors
- provides helpful but secure error responses
- does not reveal information about existing accounts
