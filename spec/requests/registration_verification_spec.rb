require 'rails_helper'

RSpec.describe 'User registration and verification', type: :request do
  before do
    ActiveJob::Base.queue_adapter = :inline
  end

  let(:valid_params) do
    {
      user: {
        name: 'Test Student',
        email: '1155123456@link.cuhk.edu.hk',
        password: 'password123',
        hostel: 'Hall A'
      }
    }
  end

  it 'registers a user and sends verification email, then verifies with token' do
    post register_users_path, params: valid_params
    expect(response).to have_http_status(:created)

    user = User.find_by(email: valid_params[:user][:email])
    expect(user).not_to be_nil
    expect(user.verification_otp).to be_present

    # verify endpoint
    post verify_users_path, params: { otp: user.verification_otp, email: user.email }
    expect(response).to have_http_status(:ok)
    user.reload
    expect(user.verified_at).to be_present
  end
end
