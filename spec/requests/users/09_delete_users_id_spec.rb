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

  describe 'DELETE /users/:id' do
    context 'when authenticated' do
      before do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end
      end

      it 'deletes the user' do
        user_id = user.id
        delete user_path(user.cuhk_id)
        expect(response).to have_http_status(:no_content)
        expect(User.find_by(id: user_id)).to be_nil
      end

      it 'does not delete other users' do
        delete user_path(user.cuhk_id)
        expect(another_user.reload).to be_persisted
      end
    end

    context 'when not authenticated' do
      it 'requires authentication' do
        delete user_path(user.cuhk_id), headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when deleting non-existent user' do
      it 'returns 404' do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end

        delete user_path('9999999999')
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
