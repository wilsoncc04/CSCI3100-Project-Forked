# for template
module Api
  module V1
    class UsersController < ApplicationController
    def index
    end
    
    #   def create
    #     user = User.new(user_params)
    #     if user.save
    #       render json: { message: 'User created successfully' }, status: :created
    #     else
    #       render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    #     end
    #   end

    #   private

    #   def user_params
    #     params.require(:user).permit(:email, :password, :password_confirmation)
    #   end
    end
  end
end
