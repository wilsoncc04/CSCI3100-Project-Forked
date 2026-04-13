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
    let(:admin_user) { create(:user, is_admin: true, verified_at: Time.current) }

    context 'when requester is admin and user exists' do
      before do
        allow_any_instance_of(UsersController).to receive(:current_user).and_return(admin_user)
      end

      it 'returns the user details' do
        get user_path(user.cuhk_id), headers: json_headers

        expect(response).to have_http_status(:ok)
        user_data = JSON.parse(response.body)
        expect(user_data['email']).to eq(user.email)
        expect(user_data['cuhk_id']).to eq(user.cuhk_id)
      end

      it 'returns user with all public attributes' do
        get user_path(user.cuhk_id), headers: json_headers

        user_data = JSON.parse(response.body)
        expect(user_data).to include(
          'id', 'email', 'name', 'cuhk_id', 'hostel', 'is_admin', 'college'
        )
      end

      it 'does not expose sensitive information' do
        get user_path(user.cuhk_id), headers: json_headers

        user_data = JSON.parse(response.body)
        expect(user_data).not_to include('password_digest', 'verification_otp')
      end
    end

    context 'when requester is admin and user does not exist' do
      before do
        allow_any_instance_of(UsersController).to receive(:current_user).and_return(admin_user)
      end

      it 'returns 404 error' do
        get user_path('9999999999'), headers: json_headers

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to include('error')
      end
    end

    context 'when requester is authenticated but not admin' do
      before do
        allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
      end

      it 'returns forbidden' do
        get user_path(another_user.cuhk_id), headers: json_headers

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)).to include('error' => 'unauthorized')
      end
    end

    context 'when requester is unauthenticated' do
      it 'returns unauthorized' do
        get user_path(user.cuhk_id), headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to include('error' => 'unauthenticated')
      end
    end
  end
end
