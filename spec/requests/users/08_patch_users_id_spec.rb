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

  describe 'PATCH /users/:id' do
    context 'when authenticated' do
      before do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end
      end

      context 'with valid parameters' do
        it 'updates the user' do
          patch user_path(user.cuhk_id), params: {
            user: {
              name: 'Updated Name',
              hostel: 'Off-campus'
            }
          }
          expect(response).to have_http_status(:ok)
          user.reload
          expect(user.name).to eq('Updated Name')
          expect(user.hostel).to eq('Off-campus')
        end

        it 'returns updated user data' do
          patch user_path(user.cuhk_id), params: {
            user: {
              name: 'Updated Name'
            }
          }
          response_data = JSON.parse(response.body)
          expect(response_data['name']).to eq('Updated Name')
        end
      end

      context 'with invalid parameters' do
        it 'fails with invalid email format' do
          patch user_path(user.cuhk_id), params: {
            user: {
              email: 'invalid@email.com'
            }
          }
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context 'with profile picture upload' do
        # Helper to create a test image file
        def create_test_image
          file = Tempfile.new(['test', '.jpg'])
          file.write("fake JPEG content for testing")
          file.rewind
          Rack::Test::UploadedFile.new(file.path, 'image/jpeg')
        end

        # Test basic image upload
        it 'uploads profile picture successfully' do
          test_image = create_test_image
          patch user_path(user.cuhk_id), params: {
            profile_picture: test_image
          }
          expect(response).to have_http_status(:ok)
          response_data = JSON.parse(response.body)
          expect(response_data['profile_picture_url']).to be_present
        end

        # Test that image is attached to user
        it 'attaches image to user model' do
          test_image = create_test_image
          patch user_path(user.cuhk_id), params: {
            profile_picture: test_image
          }
          user.reload
          expect(user.profile_picture).to be_attached
        end

        # Test that old image is replaced
        it 'replaces existing profile picture' do
          # Upload first image
          first_image = create_test_image
          patch user_path(user.cuhk_id), params: {
            profile_picture: first_image
          }
          user.reload
          expect(user.profile_picture).to be_attached

          # Upload second image - should replace
          second_image = create_test_image
          patch user_path(user.cuhk_id), params: {
            profile_picture: second_image
          }
          user.reload
          expect(user.profile_picture).to be_attached
        end

        # Test that profile picture URL is returned
        it 'returns profile picture URL in response' do
          test_image = create_test_image
          patch user_path(user.cuhk_id), params: {
            profile_picture: test_image
          }
          response_data = JSON.parse(response.body)
          expect(response_data['profile_picture_url']).to include('blob')
        end

        # Test combining profile picture with other attributes
        it 'updates both profile picture and other attributes' do
          test_image = create_test_image
          patch user_path(user.cuhk_id), params: {
            profile_picture: test_image,
            user: {
              name: 'Updated Name',
              hostel: 'Off-campus'
            }
          }
          expect(response).to have_http_status(:ok)
          user.reload
          expect(user.name).to eq('Updated Name')
          expect(user.hostel).to eq('Off-campus')
          expect(user.profile_picture).to be_attached
        end

        # Test that nil profile picture doesn't cause error
        it 'handles nil profile picture gracefully' do
          patch user_path(user.cuhk_id), params: {
            profile_picture: nil,
            user: {
              name: 'Updated Name'
            }
          }
          expect(response).to have_http_status(:ok)
          user.reload
          expect(user.name).to eq('Updated Name')
        end

        # Test profile picture URL is nil when no image
        it 'returns nil profile_picture_url when no image attached' do
          patch user_path(user.cuhk_id), params: {
            user: {
              name: 'Test User'
            }
          }
          response_data = JSON.parse(response.body)
          expect(response_data['profile_picture_url']).to be_nil
        end
      end
    end

    context 'when not authenticated' do
      it 'requires authentication' do
        patch user_path(user.cuhk_id), params: {
          user: {
            name: 'Updated Name'
          }
        }, headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when updating non-existent user' do
      it 'returns 404' do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end

        patch user_path('9999999999'), params: {
          user: {
            name: 'Updated Name'
          }
        }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

end
