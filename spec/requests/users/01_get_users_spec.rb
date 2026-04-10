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
    context 'when listing all users' do
      before { create_list(:user, 3, verified_at: Time.current) }

      it 'returns all users' do
        get users_path
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to be_an(Array)
        expect(JSON.parse(response.body).length).to eq(3)
      end

      it 'returns users with correct attributes' do
        get users_path
        users_data = JSON.parse(response.body)
        expect(users_data.first).to include(
          'id', 'email', 'name', 'cuhk_id', 'hostel', 'is_admin'
        )
      end
    end

    context 'when no users exist' do
      it 'returns an empty array' do
        get users_path
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq([])
      end
    end
  end
end
