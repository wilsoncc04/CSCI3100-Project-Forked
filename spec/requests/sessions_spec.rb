require 'rails_helper'

RSpec.describe 'Sessions API', type: :request do
  let(:user) { create(:user, email: '1155123456@link.cuhk.edu.hk', password: 'password123', verified_at: Time.current) }
  let(:unverified_user) { create(:user, email: '1155654321@link.cuhk.edu.hk', password: 'password123', verified_at: nil) }

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
        
        expect(user_data).to include('id', 'email', 'name', 'cuhk_id', 'hostel', 'is_seller')
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

  describe 'DELETE /sessions/:id (logout)' do
    it 'returns no content status' do
      delete session_path(1)
      expect(response).to have_http_status(:no_content)
    end

    it 'returns empty response body' do
      delete session_path(1)
      expect(response.body).to be_empty
    end
  end
end
