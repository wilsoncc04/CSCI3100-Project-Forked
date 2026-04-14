Feature: Change Password from Account Page
  As a logged-in user
  I want to change my password from the account settings
  So that I can keep my account secure

  Background:
    Given the following users exist:
      | email                        | password     |
      | 1155000100@link.cuhk.edu.hk  | currentPass1 |

  @javascript
  Scenario: Successfully change password with correct current password
    Given I am logged in as "1155000100@link.cuhk.edu.hk" with password "currentPass1"
    And I am on the "Account" page
    When I click the "Reset Password" sidebar tab
    And I fill in the current password with "currentPass1"
    And I fill in the new password fields with "newSecurePass1"
    And I click the "Update Password" button
    Then I should see "Password changed successfully!"
    And the account "1155000100@link.cuhk.edu.hk" should authenticate with "newSecurePass1"

  @javascript
  Scenario: Change password fails with incorrect current password
    Given I am logged in as "1155000100@link.cuhk.edu.hk" with password "currentPass1"
    And I am on the "Account" page
    When I click the "Reset Password" sidebar tab
    And I fill in the current password with "wrongPassword"
    And I fill in the new password fields with "newPass123"
    And I click the "Update Password" button
    Then I should see "invalid_credentials"
    And the account "1155000100@link.cuhk.edu.hk" should authenticate with "currentPass1"

  @javascript
  Scenario: Change password fails when new passwords do not match
    Given I am logged in as "1155000100@link.cuhk.edu.hk" with password "currentPass1"
    And I am on the "Account" page
    When I click the "Reset Password" sidebar tab
    And I fill in the current password with "currentPass1"
    And I fill in mismatched new passwords
    And I click the "Update Password" button
    Then I should see "New passwords do not match"
