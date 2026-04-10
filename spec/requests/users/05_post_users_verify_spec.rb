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

  describe 'POST /users/verify' do
    let(:unverified_user) { create(:user, verified_at: nil) }

    context 'with valid OTP' do
      it 'verifies the user' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
        }
        expect(response).to have_http_status(:ok)
        unverified_user.reload
        expect(unverified_user.verified_at).to be_present
      end

      it 'clears the OTP after verification' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
          # refer to itself (ok in backend, but not frontend)
        }
        unverified_user.reload
        expect(unverified_user.verification_otp).to be_nil
      end

      it 'returns success message' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
        }
        expect(JSON.parse(response.body)).to include('message' => 'verified')
      end
    end

    context 'with invalid OTP' do
      it 'fails with incorrect OTP' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: '000000'
        }
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)).to include('error')
      end

      it 'fails with missing OTP' do
        post verify_users_path, params: {
          email: unverified_user.email
        }
        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)).to include('error' => 'otp_missing')
      end

      it 'fails with non-existent email' do
        post verify_users_path, params: {
          email: 'nonexistent@link.cuhk.edu.hk',
          otp: '123456'
        }
        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to include('error')
      end
    end

    context 'when OTP expires' do
      it 'fails with expired OTP' do
        unverified_user.update(verification_sent_at: 25.hours.ago)
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
        }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
