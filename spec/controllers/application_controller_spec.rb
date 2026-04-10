require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller(ApplicationController) do
    def json_authenticate
      authenticate_user!
      render json: { ok: true } unless performed?
    end

    def html_authenticate
      authenticate_user!
      render plain: 'ok' unless performed?
    end

    def authorize_target
      user = User.find(params[:id])
      authorize_user!(user)
      render plain: 'authorized' unless performed?
    end

    def standard_error_response
      error = StandardError.new('boom')
      error.set_backtrace([ 'spec/backtrace_line.rb:1' ])
      render_error(error)
    end

    def array_error_response
      render_error([ 'first_error', 'second_error' ], status: :unprocessable_content)
    end
  end

  before do
    routes.draw do
      get 'json_authenticate' => 'anonymous#json_authenticate'
      get 'html_authenticate' => 'anonymous#html_authenticate'
      get 'authorize_target/:id' => 'anonymous#authorize_target'
      get 'standard_error_response' => 'anonymous#standard_error_response'
      get 'array_error_response' => 'anonymous#array_error_response'
    end
  end

  describe 'authentication helpers' do
    it 'returns unauthorized json for unauthenticated json requests' do
      request.headers['CONTENT_TYPE'] = 'application/json'

      get :json_authenticate, format: :json

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body['error']).to eq('unauthenticated')
      expect(body['errors']).to eq([ 'unauthenticated' ])
    end

    it 'redirects html requests to root when unauthenticated' do
      get :html_authenticate

      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(root_path)
    end
  end

  describe 'authorization helpers' do
    let(:user) { create(:user, verified_at: Time.current) }
    let(:other_user) { create(:user, verified_at: Time.current) }

    it 'allows access when current user matches target user' do
      allow(controller).to receive(:current_user).and_return(user)

      get :authorize_target, params: { id: user.id }

      expect(response).to have_http_status(:ok)
      expect(response.body).to eq('authorized')
    end

    it 'redirects html requests when user is unauthorized' do
      allow(controller).to receive(:current_user).and_return(other_user)

      get :authorize_target, params: { id: user.id }

      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(root_path)
    end
  end

  describe '#render_error' do
    it 'renders internal_server_error for StandardError input' do
      fake_logger = Logger.new(nil)
      allow(controller).to receive(:logger).and_return(fake_logger)

      get :standard_error_response, format: :json

      expect(response).to have_http_status(:internal_server_error)
      body = JSON.parse(response.body)
      expect(body['error']).to eq('boom')
      expect(body['errors']).to eq([ 'boom' ])
    end

    it 'renders provided status and messages for array errors' do
      get :array_error_response, format: :json

      expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body['error']).to eq('first_error')
      expect(body['errors']).to eq([ 'first_error', 'second_error' ])
    end
  end
end
