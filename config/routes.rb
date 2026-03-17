Rails.application.routes.draw do
  root 'pages#index'
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

    # API routes for core resources
    resources :users, only: [:index, :show, :create, :update, :destroy] do
      collection do
        get :sellers
        post :register
        get :verify
      end
    end

    resources :products do
      # Add a collection route for price_history. This will be reachable at
      # GET /products/price_history and should accept a `product_id` query param.
      collection do
        get :price_history
      end
    end

    resources :chats, only: [:index, :show, :create] do
      resources :messages, only: [:index, :create, :show, :destroy]
    end

    resources :messages, only: [:index, :show, :create, :destroy]

    resources :sessions, only: [:create, :destroy]

    # catch-all route to handle client-side routing in a single-page application (SPA).
  get '*path', to: 'pages#index', via: :all

end
