# Email Registration & Verification — Setup and Usage

This document explains how the email-based registration and verification flow works, how to configure mail delivery for development and production (Heroku), and how to test it.

## Overview
- Registration endpoint: `POST /users/register` — accepts `user` params (e.g. `name`, `email`, `password`, `hostel`).
- After successful registration the app generates a `verification_token` and sends a verification email. The controller returns `{ user: ..., message: 'verification_email_sent' }`.
- Verification endpoint: `GET /users/verify?token=...` — validates token, sets `verified_at`, and clears the token.
- Login enforces verification: `SessionsController#create` checks `verified_at` and returns `email_not_verified` if not verified.

## Relevant files
- User model: [app/models/user.rb](app/models/user.rb)
- Users controller: [app/controllers/users_controller.rb](app/controllers/users_controller.rb)
- Sessions controller (login): [app/controllers/sessions_controller.rb](app/controllers/sessions_controller.rb)
- Mailer: [app/mailers/user_mailer.rb](app/mailers/user_mailer.rb)
- Mailer view: [app/views/user_mailer/verification_email.html.erb](app/views/user_mailer/verification_email.html.erb)
- Migration (adds `password_digest`, `verification_token`, etc.): [db/migrate/20260317123000_add_auth_and_verification_to_users.rb](db/migrate/20260317123000_add_auth_and_verification_to_users.rb)
- Front-end helper: `app/javascript/common/register.js` (client calls `POST /users/register` and `GET /users/verify`)
- RSpec request spec: [spec/requests/registration_verification_spec.rb](spec/requests/registration_verification_spec.rb)

## Development setup (local)
1. Install new gems and run migrations:
```bash
bundle install
rails db:migrate
```
2. The app uses `bcrypt` and `has_secure_password` for authentication.
3. In development we use `letter_opener` to preview emails locally. Configuration is in [config/environments/development.rb](config/environments/development.rb) and the gem is in the `:development` group in the `Gemfile`.
4. Start the Rails server and register a user via the client or curl:
```bash
# example curl
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"user":{"name":"Test","email":"1155123456@link.cuhk.edu.hk","password":"password123","hostel":"Hall A"}}'
```
5. `letter_opener` will open the verification email in your browser; click the verification link (it points to `/users/verify?token=...`).

## Production setup (Heroku example)
1. Provision an email provider add-on (SendGrid example):
```bash
heroku addons:create sendgrid:starter --app YOUR_APP_NAME
```
2. Set SMTP config vars on Heroku (SendGrid uses `apikey` as username):
```bash
# fetch SENDGRID_API_KEY first then set vars, or use direct values
heroku config:set SMTP_ADDRESS=smtp.sendgrid.net \
  SMTP_PORT=587 \
  SMTP_USERNAME=apikey \
  SMTP_PASSWORD="$(heroku config:get SENDGRID_API_KEY --app YOUR_APP_NAME)" \
  --app YOUR_APP_NAME
```
3. Ensure `config/environments/production.rb` has SMTP settings that read these ENV variables (this project already includes an example using `ENV['SMTP_*']`).
4. Verify your sending domain in the provider dashboard and add required DNS records (SPF/DKIM) for deliverability.
5. Deploy and run migrations:
```bash
git push heroku main
heroku run rails db:migrate --app YOUR_APP_NAME
```
6. Test sending a live verification email from a one-off console:
```bash
heroku run rails console --app YOUR_APP_NAME
# in console
UserMailer.verification_email(User.first).deliver_now
```

## Background jobs & delivery
- The controller uses `deliver_later` to send emails asynchronously. Configure `config.active_job.queue_adapter` in production (e.g., Sidekiq, Resque) and ensure the queue processor is running.
- In tests the request spec sets `ActiveJob::Base.queue_adapter = :inline` to deliver immediately.

## Testing
- Request spec: run the spec added for registration and verification:
```bash
bundle exec rspec spec/requests/registration_verification_spec.rb
```
- The spec registers a user, ensures a `verification_token` is set, calls the `verify` endpoint, and asserts `verified_at` is present.

## Front-end
- The minimal helper is in `app/javascript/common/register.js` and contains `registerUser()` and `verifyToken()` to call the backend endpoints.
- Flow: client calls `POST /users/register`, user receives email, clicks or client calls the `GET /users/verify?token=...` URL.

## Security & suggestions
- Ensure `has_secure_password` uses the `password_digest` column (migration added this). Do not store plaintext passwords.
- Consider adding rate-limiting to registration and verification endpoints.
- Add an endpoint to re-send verification emails for users who lost their email.
- Consider requiring `verified_at` before allowing access to sensitive endpoints (already enforced in `SessionsController#create`).

## Troubleshooting
- If emails are not sending in production, check `heroku logs --tail --app YOUR_APP_NAME` for SMTP errors.
- Confirm ENV variables are set on Heroku: `heroku config --app YOUR_APP_NAME`.
- If using a provider's API (SendGrid API), you can use provider-specific gems/clients instead of SMTP for better reliability.

---

If you want, I can:
- Add a `resend_verification` endpoint in `UsersController`.
- Add a small rake task to send a test email.
- Add instructions to use AWS SES or Postmark instead of SMTP.
