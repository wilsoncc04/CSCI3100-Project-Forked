Rails.application.routes.draw do
  root 'pages#index'
  # ===== API ROUTES =====
  resources :users, only: [:index, :show, :create, :update, :destroy] do
    collection do
      get :admins                   # GET /users/admins - list all admins
      post :register                # POST /users/register - alias for create (user registration)
      post :verify                  # POST /users/verify - verify email with OTP
      post :resend_verification     # POST /users/resend_verification - resend OTP email
      post :change_password         # POST /users/change_password - update password
      get :interests                # GET /users/interests - list user's interested products
    end
  end

  resources :products do
    collection do
      get :price_history           # GET /products/price_history?product_id=X&points=Y
      get :selling                 # GET /products/selling - list current user's selling products
    end
    member do
    post :interest, to: 'products#toggle_interest'
    post :buy
  end
  end

  resources :community_items, only: [:index, :create, :update, :destroy]

  resources :chats, only: [:index, :show, :create] do
    resources :messages, only: [:index, :create, :show, :destroy]
  end

  # Login session
  get '/sessions', to: 'sessions#show'
  resources :sessions, only: [:create] do
    collection do
      delete :destroy # DELETE /sessions/destroy - logout
    end
  end

  # handle all other routes with React Router (for client-side routing)
  post '/users/register', to: 'users#register'
  post '/users/verify', to: 'users#verify'
  get '*path', to: 'pages#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
