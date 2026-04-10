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

  describe 'GET /users/:id' do
    context 'when user exists' do
      it 'returns the user details' do
        get user_path(user.cuhk_id)
        expect(response).to have_http_status(:ok)
        user_data = JSON.parse(response.body)
        expect(user_data['email']).to eq(user.email)
        expect(user_data['cuhk_id']).to eq(user.cuhk_id)
      end

      it 'returns user with all public attributes' do
        get user_path(user.cuhk_id)
        user_data = JSON.parse(response.body)
        expect(user_data).to include(
          'id', 'email', 'name', 'cuhk_id', 'hostel', 'is_admin', 'college'
        )
      end

      it 'does not expose sensitive information' do
        get user_path(user.cuhk_id)
        user_data = JSON.parse(response.body)
        expect(user_data).not_to include('password_digest', 'verification_otp')
      end
    end

    context 'when user does not exist' do
      it 'returns 404 error' do
        get user_path('9999999999')
        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to include('error')
      end
    end
  end
end
