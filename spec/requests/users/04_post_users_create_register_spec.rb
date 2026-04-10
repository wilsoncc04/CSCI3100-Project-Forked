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

  describe 'POST /users (create/register)' do
    let(:valid_params) do
      {
        user: {
          name: 'New Student',
          email: '1155999999@link.cuhk.edu.hk',
          password: 'securepassword123',
          cuhk_id: '1155999999',
          hostel: 'On-campus',
          college: 'Chung Chi College',
          is_admin: false
        }
      }
    end

    context 'with valid parameters' do
      it 'creates a new user' do
        expect {
          post users_path, params: valid_params
        }.to change(User, :count).by(1)
      end

      it 'returns created status' do
        post users_path, params: valid_params
        expect(response).to have_http_status(:created)
      end

      it 'returns user data without sensitive info' do
        post users_path, params: valid_params
        response_data = JSON.parse(response.body)
        expect(response_data).to include('message' => 'verification_email_sent')
        expect(response_data['user']).to include('email', 'name', 'cuhk_id')
        expect(response_data['user']).not_to include('password_digest', 'verification_otp')
      end

      it 'generates verification OTP' do
        post users_path, params: valid_params
        new_user = User.find_by(email: valid_params[:user][:email])
        expect(new_user.verification_otp).to be_present
        expect(new_user.verification_sent_at).to be_present
      end

      it 'sends verification email' do
        expect {
          post users_path, params: valid_params
        }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      it 'does not verify user immediately' do
        post users_path, params: valid_params
        new_user = User.find_by(email: valid_params[:user][:email])
        expect(new_user.verified_at).to be_nil
      end
    end

    context 'with invalid parameters' do
      it 'fails with invalid email format' do
        invalid_params = valid_params.deep_dup # duplicate without sharing same hash
        invalid_params[:user][:email] = 'invalid@email.com'
        post users_path, params: invalid_params
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)).to include('errors')
      end

      it 'fails with missing password' do
        invalid_params = valid_params.deep_dup
        invalid_params[:user].delete(:password)
        post users_path, params: invalid_params
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'fails with duplicate email' do
        post users_path, params: valid_params
        post users_path, params: valid_params
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)).to include('errors')
      end

      it 'fails with missing required fields' do
        invalid_params = {
          user: {
            name: 'Test'
            # Missing email, password, etc.
          }
        }
        post users_path, params: invalid_params
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
