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

  describe 'Authorization checks' do
    context 'when updating user' do
      it 'allows user to update their own account' do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end

        patch user_path(user.cuhk_id), params: {
          user: { name: 'Updated Name' }
        }
        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.name).to eq('Updated Name')
      end

      it 'prevents user from updating another user' do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end

        patch user_path(another_user.cuhk_id), params: {
          user: { name: 'Hacked Name' }
        }, headers: json_headers
        expect(response).to have_http_status(:forbidden)
        another_user.reload
        expect(another_user.name).not_to eq('Hacked Name')
      end
    end

    context 'when deleting user' do
      it 'allows user to delete their own account' do
        user_id = user.id
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end

        delete user_path(user.cuhk_id)
        expect(response).to have_http_status(:no_content)
        expect(User.find_by(id: user_id)).to be_nil
      end

      it 'prevents user from deleting another user' do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end

        delete user_path(another_user.cuhk_id), headers: json_headers
        expect(response).to have_http_status(:forbidden)
        expect(another_user.reload).to be_persisted
      end
    end
  end
end
