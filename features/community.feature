Feature: Community Unit
  As a CUHK student
  I want to promote my products to my college community
  So that my college mates can see them

  Background:
    Given the following users exist:
    | email                       | password | name   | college           |
    | 1155123456@link.cuhk.edu.hk | password | Wilson | Chung Chi College |
    And I am logged in as "1155123456@link.cuhk.edu.hk" with password "password"

  Scenario: Promoting a product to the community during listing
    When I am on the sell page
    And I fill in "Product Name" with "Textbook"
    And I fill in "Price" with "50"
    And I fill in "Contact Info" with "WhatsApp 12345678"
    And I check "Promote to College Community Board"
    And I fill in "Advertisement Description" with "Great for CC students taking CSCI3100"
    And I click "Post Product"
    Then I should see "Product listed successfully"
    When I go to the community page
    And I filter by "Chung Chi College"
    Then I should see "Great for CC students taking CSCI3100"
    And I should see "Textbook"
