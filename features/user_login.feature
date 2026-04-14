Feature: User Authentication
  As a CUHK student
  I want to log in to the marketplace with my university email
  So that I can access my account and trade goods

  Background:
    Given the following users exist:
      | email                       | password    | name   |
      | 1155000123@link.cuhk.edu.hk | mySecret123 | Harvey |
      | 1155999888@link.cuhk.edu.hk | unverified1 | UnverifiedUser |
    And the user "1155999888@link.cuhk.edu.hk" is unverified

  @javascript
  Scenario: Successful login with valid CUHK credentials
    When I open the login page
    And I enter "1155000123@link.cuhk.edu.hk" as email
    And I enter "mySecret123" as password
    And I click the "Login" button
    Then I should see a success notification "Login Success!"
    And I should be redirected to the "Account" page

  @javascript
  Scenario: Login failure due to unverified email
    When I open the login page
    And I enter "1155999888@link.cuhk.edu.hk" as email
    And I enter "unverified1" as password
    And I click the "Login" button
    Then I should see an error notification "Your email is not verified. Please check your inbox for the OTP."

  @javascript
  Scenario: Browser-side validation for invalid email format
    When I open the login page
    And I enter "wrong.email@gmail.com" as email
    And I click the "Login" button
    Then the email input should show a validation error