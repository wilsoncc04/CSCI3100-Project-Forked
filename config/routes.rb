Rails.application.routes.draw do
  root 'pages#index'
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

    # API routes for core resources
    resources :users, only: [:index, :show, :create, :update, :destroy]

    resources :products do
      # Begins a member block inside products to add routes that act on a single product (member routes include the product :id).
      member do
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
