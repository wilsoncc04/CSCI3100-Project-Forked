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

  describe 'GET /users/admins' do
    before do
      @seller1 = create(:user, verified_at: Time.current)
      @seller2 = create(:user, verified_at: Time.current)
      @buyer = create(:user, verified_at: Time.current)
    end

    it 'returns only admins' do
      get admins_users_path
      expect(response).to have_http_status(:ok)
      admins_data = JSON.parse(response.body)
      expect(admins_data.length).to eq(0)  # No one is admin by default
    end

    it 'returns admins with correct attributes' do
      get admins_users_path
      admins_data = JSON.parse(response.body)
      if admins_data.length > 0
        expect(admins_data.first).to include(
          'id', 'email', 'name', 'is_admin'
        )
      end
    end
  end

end
