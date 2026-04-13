Feature: User Logout
  As a user
  So that I can protect my privacy on shared devices
  I want to safely log out of my account

  @javascript
  Scenario: Successful logout
    Given I am on the profile page
    And I am logged in as "1155000002@link.cuhk.edu.hk" with password "55555555"
    When I click on the "Log out" sidebar link
    And I confirm the logout dialog
    Then I should see "您已成功登出"
    And I should see "重新登入"