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

  describe 'POST /users/resend_verification' do
    let(:unverified_user) { create(:user, verified_at: nil) }

    context 'with valid email' do
      it 'resends verification email' do
        expect {
          post resend_verification_users_path, params: { email: unverified_user.email }
        }.to change(ActionMailer::Base.deliveries, :count).by(1)
      end

      it 'generates new OTP' do
        old_otp = unverified_user.verification_otp
        post resend_verification_users_path, params: { email: unverified_user.email }
        unverified_user.reload
        # likely not to be the same OTP
        expect(unverified_user.verification_otp).not_to eq(old_otp)
      end

      it 'returns generic success message' do
        post resend_verification_users_path, params: { email: unverified_user.email }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'verification_email_sent_if_needed'
        )
      end
    end

    context 'with invalid email' do
      it 'returns generic success message to prevent account enumeration' do
        post resend_verification_users_path, params: { email: 'nonexistent@link.cuhk.edu.hk' }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'verification_email_sent_if_needed'
        )
      end
    end

    context 'with no email' do
      it 'returns generic success message' do
        post resend_verification_users_path, params: {}
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'verification_email_sent_if_needed'
        )
      end
    end

    context 'when user is already verified' do
      it 'does not resend email for verified user' do
        verified_user = create(:user, verified_at: Time.current)
        expect {
          post resend_verification_users_path, params: { email: verified_user.email }
        }.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end
    end
  end
end
