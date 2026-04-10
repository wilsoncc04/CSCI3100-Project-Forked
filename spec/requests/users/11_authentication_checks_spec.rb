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

  describe 'Authentication checks' do
    it 'allows unauthenticated access to create action' do
      params = {
        user: {
          name: 'Test User',
          email: '1155888888@link.cuhk.edu.hk',
          password: 'SecurePassword123',
          cuhk_id: '1155888888',
          hostel: 'On-campus',
          is_admin: false
        }
      }
      post users_path, params: params
      expect(response.status).to eq(201)
    end

    it 'allows unauthenticated access to verify action' do
      unverified_user = create(:user, verified_at: nil)
      post verify_users_path, params: {
        email: unverified_user.email,
        otp: unverified_user.verification_otp
      }
      expect(response.status).to eq(200)
    end

    it 'allows unauthenticated access to index action' do
      get users_path
      expect(response).to have_http_status(:ok)
    end

    it 'allows unauthenticated access to show action' do
      get user_path(user.cuhk_id)
      expect(response).to have_http_status(:ok)
    end

    it 'requires authentication for update action' do
      patch user_path(user.cuhk_id), params: {
        user: { name: 'New Name' }
      }, headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it 'requires authentication for destroy action' do
      delete user_path(user.cuhk_id), headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it 'requires authentication for change_password action' do
      post change_password_users_path, params: {
        email: user.email,
        current_password: 'SecurePassword123',
        new_password: 'newpassword456'
      }, headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
