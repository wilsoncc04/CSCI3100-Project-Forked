class CommunityItemsController < ApplicationController
  before_action :authenticate_user!, except: [ :index ]
  before_action :set_community_item, only: [ :update, :destroy ]
  before_action :authorize_owner!, only: [ :update, :destroy ]

  def index
    @community_items = CommunityItem.all.includes(:user, :product)

    if params[:college].present?
      @community_items = @community_items.where(college: params[:college])
    end

    # Simple forum-like ordering: most recent posts first
    @community_items = @community_items.order(created_at: :desc)

    # Return JSON for both XHR and HTML requests to support the frontend React view
    render json: @community_items.map { |item| format_community_item(item) }
  end

  def create
    @community_item = current_user.community_items.build(community_item_params)

    # Auto-fill college from user if not provided
    @community_item.college ||= current_user.college

    if @community_item.save
      if is_json_request?
        render json: format_community_item(@community_item), status: :created
      else
        redirect_to community_items_path, notice: "Community item was successfully created."
      end
    else
      if is_json_request?
        render_error(@community_item.errors)
      else
        render :index, status: :unprocessable_entity
      end
    end
  end

  def update
    if @community_item.update(community_item_params)
      if is_json_request?
        render json: format_community_item(@community_item)
      else
        redirect_to community_items_path, notice: "Community item was successfully updated."
      end
    else
      if is_json_request?
        render_error(@community_item.errors)
      else
        render :index, status: :unprocessable_entity
      end
    end
  end

  def destroy
    @community_item.destroy
    if is_json_request?
      head :no_content
    else
      redirect_to community_items_path, notice: "Community item was successfully deleted."
    end
  end

  private

  def set_community_item
    @community_item = CommunityItem.find(params[:id])
  end

  def authorize_owner!
    unless @community_item.user_id == current_user.id
      render_unauthorized
    end
  end

  def community_item_params
    params.require(:community_item).permit(:product_id, :description, :college)
  end

  def format_community_item(item)
    {
      id: item.id,
      description: item.description,
      college: item.college,
      created_at: item.created_at,
      user: {
        id: item.user.id,
        name: item.user.name,
        college: item.user.college
      },
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        status: item.product.status,
        condition: item.product.condition,
        image_url: item.product.images.attached? ? url_for(item.product.images.first) : nil
      }
    }
  end
end
