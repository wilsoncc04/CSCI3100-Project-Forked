Feature: Notification and Chat List
  As a user of the CUHK Marketplace
  I want to see a list of my active and cancelled chats
  So that I can keep track of my trading requests

  Background:
    # 動機：複用 search_steps.rb 建立真實使用者與類別
    Given the following categories exist:
      | name        |
      | Electronics |
    And the following users exist:
      | email                       | name    | password    |
      | 1155000001@link.cuhk.edu.hk | Alice   | password123 |
      | 1155000002@link.cuhk.edu.hk | Bob     | password123 |
      | 1155000003@link.cuhk.edu.hk | Charlie | password123 |
    And the following products exist:
      | name   | seller                      | category    | price |
      | iPhone | 1155000001@link.cuhk.edu.hk | Electronics | 5000  |
      | iPad   | 1155000003@link.cuhk.edu.hk | Electronics | 4000  |
    And I am logged in as "1155000001@link.cuhk.edu.hk"

  @javascript
  Scenario: Displaying a list of active chats with correct partner names
    Given the following chats exist for me:
      | partner | product | last_message       | status |
      | Bob     | iPhone  | Is this available? | active |
      | Charlie | iPad    | I want to buy this | active |
    When I visit the notification page
    Then I should see a chat with "Bob"
    And I should see a chat with "Charlie"
    And I should see the message "Is this available?" for the chat with "Bob"

  @javascript
  Scenario: Displaying cancelled trade notifications
    Given the following chats exist for me:
      | partner | product | last_message                            | status    |
      | Bob     | iPhone  | Bob has cancelled the trading of iPhone | cancelled |
    When I visit the notification page
    Then I should see "CANCELLED" badge for the chat with "Bob"
    # 動機：檢查錯誤樣式的文字顏色
    And the message for "Bob" should be styled as an error

  @javascript
  Scenario: Navigating to specific chat details
    Given the following chats exist for me:
      | partner | product | last_message | status |
      | Bob     | iPhone  | Hello        | active |
    When I visit the notification page
    And I click on the chat with "Bob"
    # 動機：ID 是動態生成的，腳本會自動抓取最新的 Chat ID
    Then I should be redirected to the chat page for "iPhone"

  @javascript
  Scenario: Showing empty state when no chats exist
    Given I have no chats
    When I visit the notification page
    Then I should see the text "No messages yet."