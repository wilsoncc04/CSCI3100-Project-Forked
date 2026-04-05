class UserMailer < ApplicationMailer
  default from: 'noreply@csci3100-project-25spring-d069c5b80a72.herokuapp.com'

  def verification_email(user)
    @user = user
    @otp = @user.verification_otp
    # app/views/user_mailer/verification_email.html.erb
    mail(to: @user.email, subject: 'Your CUHK verification code')
  end
end
