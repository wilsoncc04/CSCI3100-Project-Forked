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

  describe 'GET /users/interests' do
    let(:category) { create(:category) }
    let(:liked_product) { create(:product, seller: another_user, category: category) }

    context 'when authenticated' do
      before do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end
      end

      it 'returns user interested products' do
        create(:interest, interested_id: user.id, item_id: liked_product.id)

        get interests_users_path, headers: json_headers

        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data).to be_an(Array)
        expect(response_data.first['id']).to eq(liked_product.id)
      end

      it 'returns empty array when user has no interests' do
        get interests_users_path, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq([])
      end
    end

    context 'when unauthenticated' do
      it 'requires authentication' do
        get interests_users_path, headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('unauthenticated')
      end
    end
  end

end
