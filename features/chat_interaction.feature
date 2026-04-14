Feature: Real-time Chat and Trade Management
  As a user involved in a transaction
  I want to communicate with the other party and manage the trade status
  So that we can complete the second-hand item exchange safely

  Background:
    Given the following categories exist:
      | name        |
      | Electronics |
    And the following users exist:
      | email                       | name   | password    |
      | 1155000001@link.cuhk.edu.hk | Seller | password123 |
      | 1155000002@link.cuhk.edu.hk | Buyer  | password123 |
    And the following products exist:
      | name   | seller                      | category    | price |
      | iPhone | 1155000001@link.cuhk.edu.hk | Electronics | 5000  |
    And a chat exists between "1155000002@link.cuhk.edu.hk" and "1155000001@link.cuhk.edu.hk" for product "iPhone"

  @javascript
  Scenario: Sending a message in an active chat
    Given I am logged in as "1155000002@link.cuhk.edu.hk"
    And I am on the chat page
    When I select the chat for "iPhone" from the sidebar
    And I type "Is this still available?" into the message input
    And I click the "Send" button
    Then I should see "Is this still available?" in the chat window

  @javascript
  Scenario: Seller confirms the trade
    Given I am logged in as "1155000001@link.cuhk.edu.hk"
    And I am on the chat page
    When I select the chat for "iPhone" from the sidebar
    And I click the "Confirm Sale" button
    And I confirm the browser popup
    Then I should see a system message "has confirmed the trade"
    And the chat should become read-only with status "This item has been sold"

  @javascript
  Scenario: Buyer cancels the trade
    Given I am logged in as "1155000002@link.cuhk.edu.hk"
    And I am on the chat page
    When I select the chat for "iPhone" from the sidebar
    And I click the "Cancel Trade" button
    And I confirm the browser popup
    Then I should see a system message "System: Buyer has cancelled the trade"
    And the chat should show a "Cancelled" badge in the sidebar