Feature: User Registration and Account Creation
  As a new student
  I want to register for a CUHK Second-hand Marketplace account
  So that I can buy and sell items with other students

  @javascript
  Scenario: Successful registration with OTP verification
    Given I am on the "registration" page
    When I fill in the following registration details:
      | name                | John Doe                    |
      | email               | 1155654321@link.cuhk.edu.hk |
      | password            | SecurePass123!              |
      | confirm_password    | SecurePass123!              |
    And I click the "Create Account" button
    Then I should see the registration OTP popup
    When I enter the registration OTP "123456"
    And I click the "Verify & Register" button
    Then I expect to see notification "successfully registered"
    And I should be redirected to the marketplace account page

  @javascript
  Scenario: Registration fails with existing email
    Given a user with email "1155999999@link.cuhk.edu.hk" already exists
    And I am on the "registration" page
    When I fill in the following registration details:
      | name                | Jane Smith                  |
      | email               | 1155999999@link.cuhk.edu.hk |
      | password            | SecurePass123!              |
      | confirm_password    | SecurePass123!              |
    And I click the "Create Account" button
    Then I expect to see notification "already"
    And the registration OTP popup should not appear

  @javascript
  Scenario: Registration fails with mismatched passwords
    Given I am on the "registration" page
    When I fill in the following registration details:
      | name                | Bob Johnson                 |
      | email               | 1155777777@link.cuhk.edu.hk |
      | password            | SecurePass123!              |
      | confirm_password    | DifferentPass123!           |
    And I click the "Create Account" button
    Then I expect to see notification "password"
    And the registration OTP popup should not appear