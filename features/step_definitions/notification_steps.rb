Given(/^the following chats exist for me:$/) do |table|
  me = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  
  table.hashes.each do |row|
    partner = User.find_by!(name: row['partner'])
    product = Product.find_by!(name: row['product'])
    product.update!(status: row['status']) if row['status'].present?
    chat = Chat.find_or_create_by!(
      item_id: product.id,
      seller_id: product.seller_id,
      interested_id: (product.seller_id == me.id ? partner.id : me.id)
    )
    Message.create!(
      chat_id: chat.id,
      sender_id: partner.id,
      message: row['last_message']
    )
    chat.touch 
  end
end

Given(/^I have no chats$/) do
  me = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  Chat.where("seller_id = ? OR interested_id = ?", me.id, me.id).destroy_all
end

When(/^I visit the notification page$/) do
  visit "/notifications"
  expect(page).not_to have_content("Loading...", wait: 10)
end

When(/^I click on the chat with "([^"]*)"$/) do |partner_name|
  expect(page).to have_content(partner_name, wait: 10)
  find('strong', text: partner_name, match: :first).click
end

Then(/^I should see a chat with "([^"]*)"$/) do |name|
  expect(page).to have_content(name)
end

Then(/^I should see the message "([^"]*)" for the chat with "([^"]*)"$/) do |msg, name|
  card = find('strong', text: name, match: :first).find(:xpath, '..')
  expect(card).to have_content(msg)
end

Then(/^I should see "([^"]*)" badge for the chat with "([^"]*)"$/) do |badge_text, name|
  partner_element = find('strong', text: name, match: :first)
  expect(partner_element).to have_text(/#{badge_text}/i)
end

Then(/^the message for "([^"]*)" should be styled as an error$/) do |name|
  name_element = find('strong', text: name, match: :first)
  card = name_element.find(:xpath, "..")
  message_element = card.find('p')
  actual_color = message_element.native.css_value('color')
  expect(actual_color).to include('220, 53, 69')
end

Then(/^I should be redirected to the chat page for "([^"]*)"$/) do |product_name|
  expect(page).to have_current_path(/\/chat\?chat_id=\d+/, wait: 10)
end