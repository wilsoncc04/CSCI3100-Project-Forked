Feature: Password Reset From Login
  As a user who forgot my password
  I want to request an OTP and reset my password from the login page
  So that I can regain account access safely

  @javascript
  Scenario: Request password reset OTP from login page
    Given the following users exist:
      | email                        | password    |
      | 1155000123@link.cuhk.edu.hk | oldPass123! |
    When I open the login page
    And I open the forgot password panel
    And I request a reset OTP for "1155000123@link.cuhk.edu.hk"
    Then I should see the password reset request confirmation

  @javascript
  Scenario: Reset password with valid OTP from login page
    Given the following users exist:
      | email                        | password    |
      | 1155000456@link.cuhk.edu.hk | oldPass456! |
    And a password reset OTP "123456" is set for "1155000456@link.cuhk.edu.hk"
    When I open the login page
    And I open the forgot password panel
    And I submit a new password "newSecure456!" with otp "123456" for "1155000456@link.cuhk.edu.hk"
    Then I should see "Password reset successful"
    And the account "1155000456@link.cuhk.edu.hk" should authenticate with "newSecure456!"

  @javascript
  Scenario: Reset password fails with invalid OTP
    Given the following users exist:
      | email                        | password    |
      | 1155000789@link.cuhk.edu.hk | oldPass789! |
    And a password reset OTP "111111" is set for "1155000789@link.cuhk.edu.hk"
    When I open the login page
    And I open the forgot password panel
    And I submit a new password "newPass789!" with otp "999999" for "1155000789@link.cuhk.edu.hk"
    Then I should see "invalid_or_expired_otp"
    And the account "1155000789@link.cuhk.edu.hk" should authenticate with "oldPass789!"

  @javascript
  Scenario: Reset password fails with mismatched new passwords
    Given the following users exist:
      | email                        | password    |
      | 1155000321@link.cuhk.edu.hk | oldPass321! |
    And a password reset OTP "654321" is set for "1155000321@link.cuhk.edu.hk"
    When I open the login page
    And I open the forgot password panel
    And I submit mismatched passwords for "1155000321@link.cuhk.edu.hk" with otp "654321"
    Then I should see "do not match"
