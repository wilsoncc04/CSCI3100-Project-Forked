# features/step_definitions/selling_steps.rb

# --- 1. 資料準備 ---
# 動機：建立屬於當前賣家的真實產品紀錄
Given(/^I have the following products in my selling list:$/) do |table|
  seller = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  category = Category.first || Category.create!(category_name: "Electronics")
  
  table.hashes.each do |row|
    Product.create!(
      name: row['name'],
      price: row['price'],
      status: row['status'],
      seller_id: seller.id,
      category_id: category.id,
      condition: "Used", # 補足模型必要的驗證欄位
      location: "Main Campus"
    )
  end
end

Given(/^I have no products listed for sale$/) do
  seller = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  Product.where(seller_id: seller.id).destroy_all
end

# --- 2. 導航邏輯 ---
# 動機：模擬從 AccountPage 點擊 "My Products" 分頁的動作
When(/^I navigate to my selling products page$/) do
  # 1. 前往帳戶主頁
  visit "/Account"
  
  # 2. 避開 Loading 畫面
  expect(page).to have_content("My Profile", wait: 10)
  
  # 3. 解決 Ambiguous match：直接找側邊欄中文字為 "My Products" 的 div
  # 動機：避開 css "nav"，直接鎖定選單項目
  find('div', text: /^My Products$/, match: :first).click
  
  # 4. 關鍵等待：確保 React 已經切換到 MyProduct 組件
  # 動機：如果畫面上還有 "Account Information"，代表還沒切換過去
  expect(page).not_to have_content("Account Information", wait: 5)
  # 確保表格標題已經出現
  expect(page).to have_content("Item Name", wait: 5)
end

# --- 3. 表格與按鈕操作 ---
# 動機：確保內容出現在同一行 (Row)，避免誤讀其他產品的資訊
Then(/^I should see a table row for "([^"]*)" with price "([^"]*)" and status "([^"]*)"$/) do |name, price, status|
  # 動機：利用真正的 <tr> 標籤進行範圍縮小
  within('tr', text: name) do
    expect(page).to have_content(price)
    # 你的 StatusBadge 會渲染出 status 文字
    expect(page).to have_content(/#{status}/i)
  end
end

When(/^I click the "([^"]*)" button for "([^"]*)"$/) do |button_text, product_name|
  # 動機：確保精確鎖定表格中的那一行。
  # 原因：因為每個產品都有 Edit/Delete，我們必須先找到包含該名稱的 <tr>。
  # 使用 match: :first 是為了防止 Header 或其他地方也有相同文字。
  row = find('tr', text: product_name, match: :first)
  
  within(row) do
    # 動機：在該行內尋找特定的按鈕。
    # 這樣 Capybara 就只會看到「這一個」Edit 或 Delete。
    click_button(button_text)
  end
end

When(/^I click the view icon for "([^"]*)"$/) do |product_name|
  # 動機：針對你的 Myproduct.jsx 結構，ViewButton 是最後一個按鈕。
  row = find('tr', text: product_name, match: :first)
  within(row) do
    # 你的 ViewButton 沒有文字，只有一個 Icon。
    # 我們點擊該行 ActionGroup 裡的最後一個按鈕。
    all('button').last.click
  end
end

# 動機：處理 JavaScript 原生彈窗 (confirm)
When(/^I confirm the deletion dialog$/) do
  # 動機：解決 Ambiguous match 錯誤。
  # 原因：之前的選擇器包含 "body"，這與內部的 modal 產生衝突。
  # 我們現在只鎖定常見的彈窗類名。
  within('.swal2-container, .modal-dialog, .modal-content', wait: 5) do
    # 動機：點擊紫色確認按鈕
    click_button("Confirm")
  end
  
  # 動機：防止非同步造成的「幻影彈窗」
  # 原因：確保點擊後，彈窗標題消失了，才繼續下一步檢查成功訊息。
  expect(page).not_to have_content("Delete Confirmation", wait: 5)
end

# --- 4. 重定向驗證 ---
Then(/^I should be redirected to the edit page for "([^"]*)"$/) do |name|
  product = Product.find_by!(name: name)
  # 動機：對齊 Myproduct.jsx 中的 navigate(`/edit/${product.id}`)
  expect(current_path).to eq("/edit/#{product.id}")
end

Then(/^I should be redirected to the detail page for "([^"]*)"$/) do |name|
  product = Product.find_by!(name: name)
  expect(current_path).to eq("/product/#{product.id}")
end

Then(/^the product "([^"]*)" should no longer be in the list$/) do |name|
  expect(page).not_to have_content(name)
end