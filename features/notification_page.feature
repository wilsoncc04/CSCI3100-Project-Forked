Feature: Notification and Chat List
  As a user of the CUHK Marketplace
  I want to see a list of my active and cancelled chats
  So that I can keep track of my trading requests

  Background:
    Given all categories exist
    And the following users exist:
      | email                       | name    | password    |
      | 1155000001@link.cuhk.edu.hk | Alice   | password123 |
      | 1155000002@link.cuhk.edu.hk | Bob     | password123 |
      | 1155000003@link.cuhk.edu.hk | Charlie | password123 |
    And the following products exist:
      | name   | seller                      | category              | price |
      | iPhone | 1155000001@link.cuhk.edu.hk | Electronics & Gadgets | 5000  |
      | iPad   | 1155000003@link.cuhk.edu.hk | Electronics & Gadgets | 4000  |
    And I am logged in as "1155000001@link.cuhk.edu.hk"

  @javascript
  Scenario: Displaying a list of active chats with correct partner names
    Given the following chats exist for me:
      | partner | product | last_message       | status    |
      | Bob     | iPhone  | Is this available? | available |
      | Charlie | iPad    | I want to buy this | available |
    When I visit the notification page
    Then I should see a chat with "Bob"
    And I should see a chat with "Charlie"
    And I should see the message "Is this available?" for the chat with "Bob"

  @javascript
  Scenario: Displaying cancelled trade notifications
    Given the following chats exist for me:
      | partner | product | last_message                            | status    |
      | Bob     | iPhone  | Bob has cancelled the trading of iPhone | available |
    When I visit the notification page
    Then I should see "Cancelled" badge for the chat with "Bob"
    And the message for "Bob" should be styled as an error

  @javascript
  Scenario: Navigating to specific chat details
    Given the following chats exist for me:
      | partner | product | last_message | status    |
      | Bob     | iPhone  | Hello        | available |
    When I visit the notification page
    And I click on the chat with "Bob"
    Then I should be redirected to the chat page for "iPhone"