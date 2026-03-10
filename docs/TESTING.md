Testing setup and commands

1) Install gems

```bash
bundle install
```

2) Create and migrate test database

```bash
RAILS_ENV=test bundle exec rails db:create db:migrate
```

3) Run unit specs (RSpec)

```bash
bundle exec rspec
```

4) Run acceptance tests (Cucumber)

```bash
bundle exec cucumber
```

Notes:
- Coverage is collected by `SimpleCov` and is configured to enforce a minimum of 80%.
- Ensure Chrome is available on your machine for system/capybara JS tests (GitHub Actions provides this).
