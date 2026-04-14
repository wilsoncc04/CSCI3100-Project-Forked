Feature: Product Listing Management
  As a student seller
  I want to create, edit, and promote my product listings
  So that I can manage my inventory with rich details and images

  Background:
    Given I am logged in as a seller

  @javascript
  Scenario: Creating a new listing with image previews
    Given I am on the "Sell an Item" page
    When I attach an image to the dropzone
    Then I should see "1 file(s) selected"
    And I should see the image preview box
    When I fill in "Product Name" with "Lab Coat"
    And I fill in "Description" with "Good condition."
    And I fill in "Price (HKD)" with "80"
    And I fill in "Contact Info" with "IG: @chem_student"
    And I click the "Confirm Listing" button
    Then I should see a success notification "Product listed successfully!"

  @javascript
  Scenario: Promoting an item to the community board
    Given I am on the "Sell an Item" page
    When I check the "Promote to College Community Board" checkbox
    Then I should see the "Advertisement Description" text area appear
    When I click the "Confirm Listing" button without filling the advertisement
    Then the form should not submit
    And I should see a validation error "Please enter a description for the community board"

  @javascript
  Scenario: Editing an existing listing
    Given I have an active listing named "Old Desk"
    When I am on the edit page for "Old Desk"
    Then I should see the title "Update Your Item"
    And the "Product Name" field should contain "Old Desk"
    When I fill in "Price (HKD)" with "150"
    And I click the "Save Changes" button
    Then I should see a success notification "Product updated successfully!"