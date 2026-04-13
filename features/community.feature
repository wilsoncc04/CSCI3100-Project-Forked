@javascript
Feature: Community Unit
  As a CUHK student
  I want to promote my products to my college community
  So that my college mates can see them

  Background:
    Given the following users exist:
    | email                       | password | name   | college           |
    | 1155123456@link.cuhk.edu.hk | password | Wilson | Chung Chi College |
    And all categories exist

  Scenario: Promoting a product to the community during listing
    Given I am logged in as "1155123456@link.cuhk.edu.hk" with password "password"
    When I am on the sell page
    And I fill in "Product Name" with "Textbook"
    And I fill in "Price (HKD) $" with "50"
    And I select "Textbooks & Notes" from the category dropdown
    And I fill in "Description" with "CSCI3100 Textbook"
    And I fill in "Contact Info (Phone / IG / Email)" with "WhatsApp 12345678"
    And I click the "Promote to College Community Board" checkbox
    And I fill in "Advertisement Description" with "Great for CC students taking CSCI3100"
    And I click "Confirm Listing"
    When I am on the community page
    And I click the "Chung Chi College" button
    Then I should see "Great for CC students taking CSCI3100"
    And I should see "Textbook"
