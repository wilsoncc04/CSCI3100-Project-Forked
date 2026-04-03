require 'rails_helper'

RSpec.describe "Pages", type: :request do
  describe "GET /" do
    it "returns http success" do
      get "/"
      expect(response).to have_http_status(:success)
      expect(response.body).to include('id="root"')
    end
  end

  describe "Catch-all route" do
    it "redirects unknown HTML paths to index" do
      get "/some-random-page"
      expect(response).to have_http_status(:success)
      expect(response.body).to include('id="root"')
    end
  end
end
