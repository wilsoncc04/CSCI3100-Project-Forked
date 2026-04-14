module NavigationHelpers
  def path_to(page_name)
    case page_name
    when /the home page/
      '/'
    when /the (.*)index\s?page/
      '/index'
    when /^the chat page$/i, /chat/i
      '/chat'
    when /^the account page$/i, /account/i
      '/Account'
    when /^the login page$/i, /login/i
      '/login'
    when /^(the )?notifications( page)?$/
      '/notifications'
    when /^(the )?interested items( page)?$/i
      '/Account'
    when /^(the )?profile page$/i
      '/Account'
    when /^(the )?my products page$/i
      '/Account'
    else
      begin
        page_name =~ /^the (.*) page$/
        path_components = $1.split(/\s+/)
        self.send(path_components.push('path').join('_').to_sym)
      rescue NoMethodError, ArgumentError
        raise "Can't find mapping from \"#{page_name}\" to a path.\n" \
              "Now, go and add a mapping in #{__FILE__}"
      end
    end
  end
end

World(NavigationHelpers)
