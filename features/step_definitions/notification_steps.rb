# features/step_definitions/notification_steps.rb

# 1. 建立真實對話與訊息紀錄
Given(/^the following chats exist for me:$/) do |table|
  # 動機：明確鎖定目前登入的 Alice
  me = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  
  table.hashes.each do |row|
    partner = User.find_by!(name: row['partner'])
    product = Product.find_by!(name: row['product'])
    
    # 動機：修正核心錯誤
    # 原因：你的資料庫中 status 欄位是在 products 表，而非 chats 表。
    # 設定產品狀態，前端 NotificationPage 會讀取 chat.product.status。
    product.update!(status: row['status']) if row['status'].present?
    
    # 建立對話 (不包含 status 參數，避開 UndefinedColumn 錯誤)
    chat = Chat.find_or_create_by!(
      item_id: product.id,
      seller_id: product.seller_id,
      interested_id: (product.seller_id == me.id ? partner.id : me.id)
    )
    
    # 動機：配合 MessagesController 邏輯建立真實訊息
    # 原因：通知列表通常會抓取最後一條訊息內容顯示。
    Message.create!(
      chat_id: chat.id,
      sender_id: partner.id,
      message: row['last_message']
    )
  end
end

Given(/^I have no chats$/) do
  me = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  Chat.where("seller_id = ? OR interested_id = ?", me.id, me.id).destroy_all
end

# 2. 導航邏輯 (複用 paths.rb)
When(/^I visit the notification page$/) do
  visit "/notifications"
end

# 3. 元素互動與驗證
When(/^I click on the chat with "([^"]*)"$/) do |partner_name|
  # 動機：找到包含夥伴名稱的選單項目
  # match: :first 防止點擊到頭像或其他重複文字
  find('div', text: partner_name, match: :first).click
end

Then(/^I should see a chat with "([^"]*)"$/) do |name|
  expect(page).to have_content(name)
end

Then(/^I should see the message "([^"]*)" for the chat with "([^"]*)"$/) do |msg, name|
  # 動機：定位到特定夥伴的卡片容器
  card = find('div', text: name, match: :first).find(:xpath, '..')
  expect(card).to have_content(msg)
end

Then(/^I should see "([^"]*)" badge for the chat with "([^"]*)"$/) do |badge_text, name|
  # 動機：定位到包含夥伴名稱的卡片內容
  card = find('div', text: name, match: :first).find(:xpath, '..')
  expect(card).to have_content(badge_text)
end

Then(/^the message for "([^"]*)" should be styled as an error$/) do |name|
  # 動機：檢查 CSS 顏色。Rails 的 Bootstrap/Styled 錯誤色通常是紅色。
  # #dc3545 等於 rgb(220, 53, 69)
  card = find('div', text: name, match: :first).find(:xpath, '..')
  # 假設錯誤訊息是在 <p> 標籤中
  message_element = card.find('p', text: /cancelled/i)
  expect(message_element.native.css_value('color')).to match(/rgb\(220, 53, 69\)/)
end

Then(/^I should be redirected to the chat page for "([^"]*)"$/) do |product_name|
  product = Product.find_by!(name: product_name)
  chat = Chat.find_by!(item_id: product.id)
  expect(current_url).to include("/chat?chat_id=#{chat.id}")
end