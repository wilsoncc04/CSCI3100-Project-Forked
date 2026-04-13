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

  describe 'GET /users' do
    let(:admin_user) { create(:user, is_admin: true, verified_at: Time.current) }

    context 'when requester is admin' do
      before do
        allow_any_instance_of(UsersController).to receive(:current_user).and_return(admin_user)
      end

      it 'returns all users' do
        create_list(:user, 3, verified_at: Time.current)

        get users_path, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to be_an(Array)
        expect(JSON.parse(response.body).length).to eq(4)
      end

      it 'returns users with correct attributes' do
        get users_path, headers: json_headers

        users_data = JSON.parse(response.body)
        expect(users_data.first).to include(
          'id', 'email', 'name', 'cuhk_id', 'hostel', 'is_admin'
        )
      end
    end

    context 'when no users exist' do
      before do
        admin_stub = build(:user, is_admin: true)
        allow_any_instance_of(UsersController).to receive(:current_user).and_return(admin_stub)
      end

      it 'returns an empty array' do
        get users_path, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq([])
      end
    end

    context 'when requester is authenticated but not admin' do
      before do
        allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
      end

      it 'returns forbidden' do
        get users_path, headers: json_headers

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)).to include('error' => 'unauthorized')
      end
    end

    context 'when requester is unauthenticated' do
      it 'returns unauthorized' do
        get users_path, headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to include('error' => 'unauthenticated')
      end
    end
  end
end
