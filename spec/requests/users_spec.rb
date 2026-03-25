require 'rails_helper'
require 'tempfile'

RSpec.describe 'Users API', type: :request do
  # Set up test environment for background jobs
  # This prevents emails from actually being sent and allows us to verify jobs were queued
  before do
    # Use :test adapter - keeps jobs in memory instead of actually executing them
    # Allows test assertions like: expect { ... }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    ActiveJob::Base.queue_adapter = :test
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
          'id', 'email', 'name', 'cuhk_id', 'hostel', 'is_seller'
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

  describe 'GET /users/sellers' do
    before do
      @seller1 = create(:user, is_seller: true, verified_at: Time.current)
      @seller2 = create(:user, is_seller: true, verified_at: Time.current)
      @buyer = create(:user, is_seller: false, verified_at: Time.current)
    end

    it 'returns only sellers' do
      get sellers_users_path
      expect(response).to have_http_status(:ok)
      sellers_data = JSON.parse(response.body)
      expect(sellers_data.length).to eq(2)
      expect(sellers_data.map { |s| s['id'] }).to match_array([@seller1.id, @seller2.id])
    end

    it 'returns sellers with correct attributes' do
      get sellers_users_path
      sellers_data = JSON.parse(response.body)
      expect(sellers_data.first).to include(
        'id', 'email', 'name', 'is_seller'
      )
    end
  end

  describe 'GET /users/:id' do
    context 'when user exists' do
      it 'returns the user details' do
        get user_path(user.cuhk_id)
        expect(response).to have_http_status(:ok)
        user_data = JSON.parse(response.body)
        expect(user_data['email']).to eq(user.email)
        expect(user_data['cuhk_id']).to eq(user.cuhk_id)
      end

      it 'returns user with all public attributes' do
        get user_path(user.cuhk_id)
        user_data = JSON.parse(response.body)
        expect(user_data).to include(
          'id', 'email', 'name', 'cuhk_id', 'hostel', 'is_seller', 'college'
        )
      end

      it 'does not expose sensitive information' do
        get user_path(user.cuhk_id)
        user_data = JSON.parse(response.body)
        expect(user_data).not_to include('password_digest', 'verification_otp')
      end
    end

    context 'when user does not exist' do
      it 'returns 404 error' do
        get user_path('9999999999')
        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to include('error')
      end
    end
  end

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
          is_seller: false
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
        }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
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
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to include('errors')
      end

      it 'fails with missing password' do
        invalid_params = valid_params.deep_dup
        invalid_params[:user].delete(:password)
        post users_path, params: invalid_params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'fails with duplicate email' do
        post users_path, params: valid_params
        post users_path, params: valid_params
        expect(response).to have_http_status(:unprocessable_entity)
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
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'POST /users/verify' do
    let(:unverified_user) { create(:user, verified_at: nil) }

    context 'with valid OTP' do
      it 'verifies the user' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
        }
        expect(response).to have_http_status(:ok)
        unverified_user.reload
        expect(unverified_user.verified_at).to be_present
      end

      it 'clears the OTP after verification' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp  
          # refer to itself (ok in backend, but not frontend)
        }
        unverified_user.reload
        expect(unverified_user.verification_otp).to be_nil
      end

      it 'returns success message' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
        }
        expect(JSON.parse(response.body)).to include('message' => 'verified')
      end
    end

    context 'with invalid OTP' do
      it 'fails with incorrect OTP' do
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: '000000'
        }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to include('error')
      end

      it 'fails with missing OTP' do
        post verify_users_path, params: {
          email: unverified_user.email
        }
        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)).to include('error' => 'otp_missing')
      end

      it 'fails with non-existent email' do
        post verify_users_path, params: {
          email: 'nonexistent@link.cuhk.edu.hk',
          otp: '123456'
        }
        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to include('error')
      end
    end

    context 'when OTP expires' do
      it 'fails with expired OTP' do
        unverified_user.update(verification_sent_at: 25.hours.ago)
        post verify_users_path, params: {
          email: unverified_user.email,
          otp: unverified_user.verification_otp
        }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'POST /users/resend_verification' do
    let(:unverified_user) { create(:user, verified_at: nil) }

    context 'with valid email' do
      it 'resends verification email' do
        expect {
          post resend_verification_users_path, params: { email: unverified_user.email }
        }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end

      it 'generates new OTP' do
        old_otp = unverified_user.verification_otp
        post resend_verification_users_path, params: { email: unverified_user.email }
        unverified_user.reload
        # likely not to be the same OTP
        expect(unverified_user.verification_otp).not_to eq(old_otp)
      end

      it 'returns generic success message' do
        post resend_verification_users_path, params: { email: unverified_user.email }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'verification_email_sent_if_needed'
        )
      end
    end

    context 'with invalid email' do
      it 'returns generic success message to prevent account enumeration' do
        post resend_verification_users_path, params: { email: 'nonexistent@link.cuhk.edu.hk' }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'verification_email_sent_if_needed'
        )
      end
    end

    context 'with no email' do
      it 'returns generic success message' do
        post resend_verification_users_path, params: {}
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'message' => 'verification_email_sent_if_needed'
        )
      end
    end

    context 'when user is already verified' do
      it 'does not resend email for verified user' do
        verified_user = create(:user, verified_at: Time.current)
        expect {
          post resend_verification_users_path, params: { email: verified_user.email }
        }.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end
    end
  end

  describe 'POST /users/change_password' do
    context 'with authentication' do
      # Prevent the controller authenticate_user! 
      # before_action from stopping requests in tests.
      # Make current_user return the test user,
      # so requests run as that authenticated user.
      before do
        allow_any_instance_of(UsersController).to receive(:authenticate_user!) do
          allow_any_instance_of(UsersController).to receive(:current_user).and_return(user)
        end
      end

      context 'with valid current password' do
        it 'changes the password' do
          expect {
            post change_password_users_path, params: {
              email: user.email,
              current_password: 'SecurePassword123',
              new_password: 'newpassword456'
            }
          }.to change { user.reload.authenticate('newpassword456') }.from(false).to(user)
        end

        it 'returns success message' do
          post change_password_users_path, params: {
            email: user.email,
            current_password: 'SecurePassword123',
            new_password: 'newpassword456'
          }
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to include('message' => 'password_changed')
        end
      end

      context 'with invalid current password' do
        it 'fails to change password' do
          post change_password_users_path, params: {
            email: user.email,
            current_password: 'wrongpassword',
            new_password: 'newpassword456'
          }
          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to include('error' => 'invalid_credentials')
        end

        it 'does not change the password' do
          post change_password_users_path, params: {
            email: user.email,
            current_password: 'wrongpassword',
            new_password: 'newpassword456'
          }
          expect(user.reload.authenticate('SecurePassword123')).to eq(user)
        end
      end

      context 'with non-existent user email' do
        it 'returns unauthorized' do
          post change_password_users_path, params: {
            email: 'nonexistent@link.cuhk.edu.hk',
            current_password: 'password123',
            new_password: 'newpassword456'
          }
          expect(response).to have_http_status(:unauthorized)
        end
      end
    end

    context 'without authentication' do
      it 'requires authentication' do
        post change_password_users_path, params: {
          email: user.email,
          current_password: 'SecurePassword123',
          new_password: 'newpassword456'
        }, headers: json_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

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
          expect(response).to have_http_status(:unprocessable_entity)
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

  describe 'Authentication checks' do
    it 'allows unauthenticated access to create action' do
      params = {
        user: {
          name: 'Test User',
          email: '1155888888@link.cuhk.edu.hk',
          password: 'SecurePassword123',
          cuhk_id: '1155888888',
          hostel: 'On-campus',
          is_seller: false
        }
      }
      post users_path, params: params
      expect(response.status).to eq(201)
    end

    it 'allows unauthenticated access to verify action' do
      unverified_user = create(:user, verified_at: nil)
      post verify_users_path, params: {
        email: unverified_user.email,
        otp: unverified_user.verification_otp
      }
      expect(response.status).to eq(200)
    end

    it 'allows unauthenticated access to index action' do
      get users_path
      expect(response).to have_http_status(:ok)
    end

    it 'allows unauthenticated access to show action' do
      get user_path(user.cuhk_id)
      expect(response).to have_http_status(:ok)
    end

    it 'requires authentication for update action' do
      patch user_path(user.cuhk_id), params: {
        user: { name: 'New Name' }
      }, headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it 'requires authentication for destroy action' do
      delete user_path(user.cuhk_id), headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it 'requires authentication for change_password action' do
      post change_password_users_path, params: {
        email: user.email,
        current_password: 'SecurePassword123',
        new_password: 'newpassword456'
      }, headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
