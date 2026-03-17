This document records a practical, Ubuntu-focused "pure JS + JSX" setup for a Rails app that uses React (JSX in .js files), esbuild, and a local PostgreSQL database (no Docker). It assumes Linux Ubuntu (20.04/22.04/24.04), Node/NPM , and that you prefer keeping all front-end files as `.js` with JSX (no TypeScript).

Overview
- Goal: Rails (Ruby 3.4.x) + React (JSX in .js) using esbuild, local PostgreSQL, and npm for package management.
- Target OS: Ubuntu / Debian-based distributions.

1) System prerequisites (Ubuntu)

Run as a user with sudo privileges:

```bash
sudo apt update
sudo apt install -y build-essential curl git ca-certificates \
  libpq-dev postgresql postgresql-contrib nodejs npm
```

- `build-essential`: native build tools for gems.
- `libpq-dev`: required to build the `pg` gem.
- `postgresql`: installs a local PostgreSQL server (we use this, not Docker).
- `nodejs` + `npm`: JavaScript runtime and package manager. You can install a newer Node via NodeSource if desired.

2) Install and configure PostgreSQL (local)

Start the Postgres service and create a local role:

```bash
sudo systemctl enable --now postgresql
sudo -u postgres createuser --interactive  # create a dev user (e.g., `devuser`)
sudo -u postgres createdb myapp_development
```

Common local setup recommendations:
- Create a Unix role matching your Linux username and give it a password if needed.
- For simple local dev, you can connect via `username: <your-linux-user>` and `host: localhost` with peer auth.
- If you prefer password auth, edit `/etc/postgresql/*/main/pg_hba.conf` and restart Postgres.

3) Install Ruby (recommended: rbenv) and Rails

Using `rbenv` (recommended):

```bash
# install rbenv (if not installed)
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-installer | bash
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

# install ruby-build plugin if not present
mkdir -p ~/.rbenv/plugins
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build

# install the Ruby version used by your project (example: 3.4.8)
rbenv install 3.4.8
rbenv local 3.4.8

gem install bundler
```

Install Rails (if not present in project Gemfile):

```bash
gem install rails -v 8.0.0 --conservative
```

Note: prefer the Rails version pinned in your repository's `Gemfile` and run `bundle install` in the project.

4) Create or prepare the Rails app with PostgreSQL and JS support

If you're creating a new app from scratch:

```bash
# create new rails app using PostgreSQL (we'll add modern JS ourselves)
rails new myapp --database=postgresql --skip-javascript
cd myapp
```

If you're working in an existing app (like this repo), skip creation and follow the steps below.

5) Add jsbundling-rails + esbuild and enable React (JSX in .js)

From your Rails project directory:

```bash
bundle add jsbundling-rails
bin/rails javascript:install:esbuild
```

Install React and React DOM with npm :

```bash
# with npm
npm install react react-dom
```

Important: ensure esbuild treats `.js` files as JSX. Update `package.json` scripts:

```json
"scripts": {
  "build": "esbuild app/javascript/application.js --bundle --sourcemap --outdir=app/assets/builds --public-path=/assets --loader:.js=jsx",
  "build:watch": "esbuild app/javascript/application.js --bundle --sourcemap --outdir=app/assets/builds --public-path=/assets --loader:.js=jsx --watch"
}
```

The key flag is `--loader:.js=jsx` which allows JSX inside `.js` files (no `.jsx` or `.tsx` required).

6) Project entry point and React components (JSX in .js)

Create `app/javascript/application.js` as the esbuild entry:

```js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

const rootElement = document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<App />);
```

Create a simple component at `app/javascript/components/App.js`:

```js
import React from "react";

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#0066cc" }}>Rails + React (JSX in .js)</h1>
      <p>Local dev with PostgreSQL and esbuild</p>
    </div>
  );
}
```

Add a mount point to your layout (for example in `app/views/layouts/application.html.erb`):

```erb
<!-- inside <body> -->
<%= yield %>
<div id="root"></div>
<%= javascript_include_tag "application", "data-turbo-track": "reload", defer: true %>
```

7) Configure Rails to use PostgreSQL

Update `config/database.yml` to include correct credentials for your local DB. Example `development` block:

```yaml
development:
  adapter: postgresql
  encoding: unicode
  database: myapp_development
  pool: 5
  username: <%= ENV.fetch("DB_USER", "your_local_user") %>
  password: <%= ENV.fetch("DB_PASSWORD", "") %>
  host: localhost
```

Create the DB and run migrations:

```bash
bundle install
bin/rails db:create db:migrate
```

8) Development workflow

Build JS assets (one-shot):

```bash
npm install
npm run build
```

Run a JS watcher with `bin/dev` (recommended for Rails 7+ setups that include a `bin/dev` script and Procfile.dev):

Create `Procfile.dev` (if not present):

```yaml
web: bin/rails server -p 3000
js:  npm run build:watch
```

Then start both services together:

```bash
bin/dev
# or if you prefer foreman: foreman start -f Procfile.dev
```

Visit http://localhost:3000 to confirm the React app is mounted and Rails is serving requests.

9) Notes & troubleshooting

- If the `pg` gem fails to compile, ensure `libpq-dev` (Debian/Ubuntu) is installed.
- If Node version is too old, install a supported Node via NodeSource or `nvm` and reinstall `node_modules`.
- For production, use `postgresql` on a managed host or containerized DB; the steps above are for local dev only.

10) Quick checklist / suggested next steps

- HTTP API: build Rails JSON endpoints under `app/controllers/api` and fetch them with `fetch` or `axios`.
- State & data fetching: consider `zustand` and `@tanstack/react-query` for client-side state and caching.
- Linting & formatting: add `eslint` + `prettier` if desired.

This guide records the Ubuntu-local variant of the "pure JSX-in-.js" setup: Rails (Ruby 3.4.x), PostgreSQL (local), esbuild with `--loader:.js=jsx`, and npm-managed React packages. For repository-specific notes or automation (e.g. `bin/setup`), I can add concrete scripts that run `rbenv` install, `bundle install`, `npm install`, DB creation, and seed steps—tell me if you want that next.

11) Axios (lightweight HTTP client)

Install with npm:

```bash
# npm
npm install axios
```

Usage example (client-side, in `app/javascript`):

```js
import axios from 'axios';

async function fetchItems() {
  const res = await axios.get('/api/v1/items');
  return res.data;
}

export default fetchItems;
```

For CSRF-safe POSTs to Rails endpoints, include the Rails CSRF token in requests:

```js
import axios from 'axios';

axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
```

Update checklist:

- Add to Quick checklist: `Axios: npm install axios`.

If you'd like, I can also add a minimal `bin/setup` script and example `Procfile.dev` entries to automate common setup steps (rbenv install, `bundle install`, `npm install`, DB creation, and seeds).