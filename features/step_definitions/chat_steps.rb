Given('I am logged in as {string}') do |email|
  visit "/login"
  find('input[type="email"]').set(email)
  find('input[type="password"]').set('password123')
  click_button('Login')
  expect(page).to have_content(/Community|Chat|Marketplace/, wait: 10)
end

Given('a chat exists between {string} and {string} for product {string}') do |buyer_email, seller_email, product_name|
  buyer = User.find_by!(email: buyer_email)
  seller = User.find_by!(email: seller_email)
  product = Product.find_by!(name: product_name)
  
  Chat.find_or_create_by!(
    item_id: product.id,
    interested_id: buyer.id,
    seller_id: seller.id
  )
end

When('I select the chat for {string} from the sidebar') do |product_name|
  expect(page).to have_content(product_name, wait: 10)
  page.execute_script(%Q{
    const chatItems = Array.from(document.querySelectorAll('div')).filter(el => {
      const clonedEl = el.cloneNode(true);
      const childText = clonedEl.textContent;
      return childText.includes("#{product_name}");
    });
    chatItems.sort((a, b) => a.textContent.length - b.textContent.length);
    
    const target = chatItems[0];
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'center' });
      target.click();
    }
  })
  sleep 2
  expect(page).to have_content("Chatting about:", wait: 10)
end


When(/^I type "([^"]*)" into the message input$/) do |text|
  expect(page).to have_selector('input[placeholder="Type a message..."]', wait: 5)
  find('input[placeholder="Type a message..."]').set(text)
end

When('I confirm the browser popup') do
  within('.swal2-container, .modal-content', wait: 5) do
    click_button("Confirm")
  end
  sleep 1
end

Then('I should see a system message {string}') do |text|
  expect(page).to have_content(/#{Regexp.escape(text)}/i, wait: 5)
end

Then('I should see {string} in the chat window') do |message|
  within('#chat-container', wait: 5) do
    expect(page).to have_content(message)
  end
end

Then('the chat should show a {string} badge in the sidebar') do |badge_text|
  expect(page).to have_content(badge_text)
end

Then('the chat should become read-only with status {string}') do |status_text|
  expect(page).not_to have_selector('form')
  expect(page).to have_content(/#{Regexp.escape(status_text)}/i)
end