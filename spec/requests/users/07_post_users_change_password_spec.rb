require 'rails_helper'
require 'tempfile'

RSpec.describe 'Users API', type: :request do
  # Set up test environment for background jobs
  # This prevents emails from actually being sent and allows us to verify jobs were queued
  before do
    # Use :test adapter - keeps jobs in memory instead of actually executing them
    # Allows test assertions like: expect { ... }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    ActiveJob::Base.queue_adapter = :test
    ActionMailer::Base.deliveries.clear
  end

  # assume the user is verified
  let(:user) { create(:user, verified_at: Time.current) }
  let(:another_user) { create(:user, password: 'password123', verified_at: Time.current) }
  # headers for JSON requests, to test API responses (instead of HTML redirects)
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  describe 'POST /users/change_password' do
    context 'with authentication' do
      # Prevent the controller authenticate_user!
      # before_action from stopping requests in tests.
      # Make current_user return the test user,
      # so requests run as that authenticated user.
      before do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end
      end

      context 'with valid current password' do
        it 'changes the password' do
          expect {
            post change_password_users_path, params: {
              email: user.email,
              current_password: 'SecurePassword123',
              new_password: 'newpassword456'
            }
          }.to change { user.reload.authenticate('newpassword456') }.from(false).to(user)
        end

        it 'returns success message' do
          post change_password_users_path, params: {
            email: user.email,
            current_password: 'SecurePassword123',
            new_password: 'newpassword456'
          }
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to include('message' => 'password_changed')
        end
      end

      context 'with invalid current password' do
        it 'fails to change password' do
          post change_password_users_path, params: {
            email: user.email,
            current_password: 'wrongpassword',
            new_password: 'newpassword456'
          }
          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to include('error' => 'invalid_credentials')
        end

        it 'does not change the password' do
          post change_password_users_path, params: {
            email: user.email,
            current_password: 'wrongpassword',
            new_password: 'newpassword456'
          }
          expect(user.reload.authenticate('SecurePassword123')).to eq(user)
        end
      end

      context 'with non-existent user email' do
        it 'returns unauthorized' do
          post change_password_users_path, params: {
            email: 'nonexistent@link.cuhk.edu.hk',
            current_password: 'password123',
            new_password: 'newpassword456'
          }
          expect(response).to have_http_status(:unauthorized)
        end
      end
    end

    context 'without authentication' do
      it 'requires authentication' do
        post change_password_users_path, params: {
          email: user.email,
          current_password: 'SecurePassword123',
          new_password: 'newpassword456'
        }, headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
