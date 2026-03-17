class UserMailer < ApplicationMailer
  default from: 'noreply@example.com'

  def verification_email(user)
    @user = user
    @url  = verify_users_url(token: @user.verification_token)
    mail(to: @user.email, subject: 'Verify your CUHK email')
  end
end
