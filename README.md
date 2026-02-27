# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions


# CSCI3100-Project

Practical notes for what to do immediately after cloning, how to run the app
locally for development, and quick pointers for deploying (Docker / production).

## Quick summary

- Ruby: use the version in `.ruby-version` (ruby-3.4.8).
- DB: the app ships configured with SQLite for development (`sqlite3`).
- JS: uses esbuild + React (see `package.json`).

Follow the "Development (quick)" steps for local work. Skip to "Deploy with
Docker" for a containerized production image.

## Prerequisites

- Git
- Ruby 3.4.8 (use rbenv / rvm / asdf). `.ruby-version` contains the required
	version.
- Bundler (gem install bundler)
- Node.js (16+ recommended) and either npm or yarn
- SQLite development headers (on Debian/Ubuntu: `libsqlite3-dev`)
- A C compiler/build tools (build-essential on Debian/Ubuntu)

On Debian/Ubuntu you can install the common packages quickly:

```bash
sudo apt update
sudo apt install -y build-essential libsqlite3-dev nodejs npm curl
# Optional (if you use yarn):
sudo npm install -g yarn
```

## Development (quick)

1. Clone the repo and cd into it:

```bash
git clone <repo-url>
cd CSCI3100-Project
```

2. Install Ruby and select the version from `.ruby-version` (example using rbenv):

```bash
# install rbenv & ruby-build, then:
rbenv install 3.4.8
rbenv local 3.4.8
gem install bundler
```

3. Install Ruby gems:

```bash
bundle install
```

4. Install JavaScript dependencies and build the client assets:

```bash
# with npm
npm install
npm run build

# or with yarn
yarn install
yarn build
```

5. Set up the database (development uses SQLite by default):

```bash
# create, migrate, seed
bin/rails db:create db:migrate db:seed
```

6. Start the app for local development. There are a few options:

- Simple Rails server (assets already built):

```bash
bin/rails server
```

- Use the Procfile.dev (requires foreman or a similar tool) to run both Rails
	and the JS watcher in parallel:

```bash
# install foreman (if needed)
gem install foreman
foreman start -f Procfile.dev
```

Or use the `bin/dev` script if present in your repo (common in Rails 7+ setups):

```bash
./bin/dev
```

7. Open http://localhost:3000 in your browser.

## Running tests

Run the Rails test suite with:

```bash
bin/rails test
```

Add JavaScript tests if/when present (this project currently uses esbuild and
React for front-end assets).

## Environment & secrets

- For local dev Rails can use `config/master.key` if committed. For production
	you must set `RAILS_MASTER_KEY` or provide a `config/credentials/production.key`.
- Common env vars you may need to set when deploying:
	- RAILS_ENV=production
	- RAILS_MASTER_KEY (or provide `config/master.key`)
	- SECRET_KEY_BASE (if not using credentials)

## Deploy with Docker (quick)

This repository includes a `Dockerfile` intended for production images.

Build the image:

```bash
docker build -t csci3100_project .
```

Run the container (example):

```bash
docker run -d -p 80:80 \
	-e RAILS_MASTER_KEY="$(cat config/master.key)" \
	--name csci3100_project csci3100_project
```

Notes:
- The Dockerfile expects a production-mode build. Ensure `RAILS_MASTER_KEY`
	(or appropriate credentials) are provided when starting the container.
- The image exposes port 80 and launches the app via `./bin/thrust` and Puma by
	default.

## Deploy to a PaaS (Heroku / Render / etc.)

General checklist:

- Ensure `RAILS_MASTER_KEY` and other secrets are configured in the host.
- Use Postgres in production (uncomment `pg` in `Gemfile` and configure
	`config/database.yml` for production). The Dockerfile includes `postgresql-client`.
- Precompile assets (`RAILS_ENV=production bin/rails assets:precompile`) before
	deployment, or rely on the buildpack/build image to do so.

## Troubleshooting

- Missing native headers / gems fail to install: install `build-essential`,
	`libsqlite3-dev` (or other DB client headers) and retry `bundle install`.
- If JS build fails, ensure Node.js version is supported and `npm install` or
	`yarn install` completed without errors.
- If you see errors about `RAILS_MASTER_KEY` or `Missing encrypted credentials`:
	set `RAILS_MASTER_KEY` from the `config/master.key` file or create new
	credentials with `bin/rails credentials:edit`.

## Notes & next steps

- The app uses Rails 8 and esbuild + React for the front-end. If you plan to
	switch to Postgres for production, update the `Gemfile` (uncomment `pg`) and
	run `bundle install` on the target environment.
- Consider adding a `bin/setup` script to automate the development setup steps
	(rbenv install, bundle install, npm install, db:setup, etc.).

If you'd like, I can add a `bin/setup` script and a short `CONTRIBUTING.md`
with one-command onboarding. Tell me which OS / developer tools you expect the
team to use (rbenv vs asdf vs system Ruby) and I'll create it.
