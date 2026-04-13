require 'rails_helper'
require 'tempfile'

RSpec.describe 'Users API', type: :request do
  before do
    ActiveJob::Base.queue_adapter = :test
    ActionMailer::Base.deliveries.clear
  end

  describe 'POST /users/forgot_password' do
    let(:verified_user) { create(:user, verified_at: Time.current) }
    let(:unverified_user) { create(:user, verified_at: nil) }

    context 'with verified user email' do
      it 'sends password reset OTP email' do
        expect {
          post forgot_password_users_path, params: { email: verified_user.email }
        }.to change(ActionMailer::Base.deliveries, :count).by(1)
      end

      it 'generates a new OTP' do
        old_otp = verified_user.verification_otp

        post forgot_password_users_path, params: { email: verified_user.email }

        verified_user.reload
        expect(verified_user.verification_otp).not_to eq(old_otp)
      end

      it 'returns generic success message' do
        post forgot_password_users_path, params: { email: verified_user.email }

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'password_reset_otp_sent_if_needed'
        )
      end
    end

    context 'with unverified user email' do
      it 'does not send password reset email' do
        expect {
          post forgot_password_users_path, params: { email: unverified_user.email }
        }.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end

      it 'returns generic success message' do
        post forgot_password_users_path, params: { email: unverified_user.email }

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'password_reset_otp_sent_if_needed'
        )
      end
    end

    context 'with invalid email' do
      it 'returns generic success message to prevent account enumeration' do
        post forgot_password_users_path, params: { email: 'nonexistent@link.cuhk.edu.hk' }

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'password_reset_otp_sent_if_needed'
        )
      end
    end

    context 'with no email' do
      it 'returns generic success message' do
        post forgot_password_users_path, params: {}

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'password_reset_otp_sent_if_needed'
        )
      end
    end
  end
end
