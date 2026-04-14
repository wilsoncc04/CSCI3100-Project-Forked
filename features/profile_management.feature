Feature: Profile Management
  As a registered user
  I want to update my account information
  So that my profile remains accurate and personalized

  Background:
    And the following users exist:
      | email                       | name      | password    | college            | hostel           |
      | 1155000123@link.cuhk.edu.hk | Test User | password123 | Chung Chi College  | Lee Shu Pui Hall |
    And I am logged in as "1155000123@link.cuhk.edu.hk"
    And I am on the profile page

  @javascript
  Scenario: Successfully update profile text information
    When I click the "Edit Profile" button
    And I fill in "username" with "New Name"
    And I fill in "bio" with "This is my new bio."
    And I click the "Save" button
    Then I should see the text "Profile updated successfully!"
    And I should see the text "New Name"
    And I should see the text "This is my new bio."

  @javascript
  Scenario: Update college and dependent hostel
    When I click the "Edit Profile" button
    And I select "New Asia College" from "college"
    And I select "Chih Hsing Hall" from "hostel"
    And I click the "Save" button
    Then I should see the text "Profile updated successfully!"
    And the account "1155000123@link.cuhk.edu.hk" should have college "New Asia College" and hostel "Chih Hsing Hall"

  @javascript
  Scenario: Prevent saving without a college
    When I click the "Edit Profile" button
    And I select "-- Select College --" from "college"
    And I click the "Save" button
    Then I should see the text "Please select your College before saving."
    And the profile should still be in edit mode