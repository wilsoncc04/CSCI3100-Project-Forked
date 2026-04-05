smtp_url = URI.parse(ENV['CLOUDMAILIN_SMTP_URL'])
ActionMailer::Base.add_delivery_method :cloudmailin, Mail::SMTP,
  address: smtp_url.host,
  port: smtp_url.port,
  user_name: smtp_url.user,
  password: smtp_url.password,
  authentication: 'plain',
  enable_starttls_auto: true