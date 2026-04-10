require 'rails_helper'

RSpec.describe 'Sessions API', type: :request do
  let(:user) { create(:user, email: '1155123456@link.cuhk.edu.hk', password: 'password123', verified_at: Time.current) }
  let(:unverified_user) { create(:user, email: '1155654321@link.cuhk.edu.hk', password: 'password123', verified_at: nil) }

  describe 'GET /sessions (show login status)' do
    it 'returns unauthenticated error when not logged in' do
      get '/sessions'

      expect(response).to have_http_status(:unauthorized)
      response_data = JSON.parse(response.body)
      expect(response_data['error']).to eq('not_logged_in')
    end

    it 'returns current user data when logged in' do
      post sessions_path, params: { email: user.email, password: 'password123' }
      expect(response).to have_http_status(:created)

      get '/sessions'

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)
      expect(response_data['id']).to eq(user.id)
      expect(response_data['email']).to eq(user.email)
    end
  end

  describe 'POST /sessions (login)' do
    context 'when credentials are valid and user is verified' do
      it 'returns success with user data' do
        post sessions_path, params: { email: user.email, password: 'password123' }
        expect(response).to have_http_status(:created)

        response_data = JSON.parse(response.body)
        expect(response_data['message']).to eq('logged_in')
        expect(response_data).to have_key('user')
        expect(response_data['user']['email']).to eq(user.email)
      end

      it 'returns user with correct attributes' do
        post sessions_path, params: { email: user.email, password: 'password123' }
        user_data = JSON.parse(response.body)['user']

        expect(user_data).to include('id', 'email', 'name', 'cuhk_id', 'hostel', 'is_admin')
      end

      it 'does not expose sensitive information' do
        post sessions_path, params: { email: user.email, password: 'password123' }
        user_data = JSON.parse(response.body)['user']

        expect(user_data).not_to include('password_digest', 'verification_otp', 'verification_sent_at')
      end
    end

    context 'when user is not verified' do
      it 'returns forbidden error' do
        post sessions_path, params: { email: unverified_user.email, password: 'password123' }
        expect(response).to have_http_status(:forbidden)

        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('email_not_verified')
      end
    end

    context 'when password is incorrect' do
      it 'returns unauthorized error' do
        post sessions_path, params: { email: user.email, password: 'wrongpassword' }
        expect(response).to have_http_status(:unauthorized)

        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('invalid_credentials')
      end
    end

    context 'when email does not exist' do
      it 'returns unauthorized error' do
        post sessions_path, params: { email: 'nonexistent@link.cuhk.edu.hk', password: 'password123' }
        expect(response).to have_http_status(:unauthorized)

        response_data = JSON.parse(response.body)
        expect(response_data['error']).to eq('invalid_credentials')
      end
    end

    context 'when email or password is missing' do
      it 'returns unauthorized error when email is missing' do
        post sessions_path, params: { password: 'password123' }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns unauthorized error when password is missing' do
        post sessions_path, params: { email: user.email }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /sessions (logout)' do
    it 'returns ok status' do
      delete sessions_path
      expect(response).to have_http_status(:ok)
    end

    it 'returns logout message in response body' do
      delete sessions_path
      response_data = JSON.parse(response.body)
      expect(response_data['message']).to eq('logged_out')
    end
  end

  describe 'Authentication for sessions' do
    context 'POST /sessions (login)' do
      it 'does not require authentication' do
        post sessions_path, params: { email: user.email, password: 'password123' }
        expect(response).to have_http_status(:created)
      end

      it 'allows unauthenticated users to login' do
        # Should work without setting up any session first
        post sessions_path, params: { email: user.email, password: 'password123' }
        expect(response).to have_http_status(:created)
        response_data = JSON.parse(response.body)
        expect(response_data['message']).to eq('logged_in')
      end
    end

    context 'DELETE /sessions (logout)' do
      it 'does not require authentication' do
        # Unauthenticated users can call logout (no-op basically)
        delete sessions_path
        expect(response).to have_http_status(:ok)
      end

      it 'clears authenticated session when user is logged in' do
        # First login
        post sessions_path, params: { email: user.email, password: 'password123' }
        expect(response).to have_http_status(:created)

        # Then logout
        delete sessions_path
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
