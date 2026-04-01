class AllowBuyerIdToBeNull < ActiveRecord::Migration[8.1]
  def change
    change_column_null :products, :buyer_id, true
  end
end
