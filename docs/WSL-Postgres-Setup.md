# WSL PostgreSQL Development Setup

This guide explains how to install, start, and use PostgreSQL for Rails development inside WSL (Windows Subsystem for Linux). It also covers using Docker instead, Rails setup, and common troubleshooting.

## Assumptions
- WSL2 (or WSL with systemd enabled) running an Ubuntu-based distro.
- You have a Rails app (this repo) that uses PostgreSQL (`config/database.yml`).
- `docker` is available if you prefer containers.

---

## Option A — Install PostgreSQL natively in WSL (recommended for simplicity)

1. Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

2. Start PostgreSQL

Try systemd first (WSL2 with systemd):

```bash
sudo systemctl enable --now postgresql
sudo systemctl status postgresql --no-pager
```

If `systemctl` isn't available, use the service command:

```bash
sudo service postgresql start
sudo service postgresql status
```

3. Create a DB role and database for development

```bash
# create a role matching your Linux username (optional)
sudo -u postgres createuser -s "$USER" || true
# create the development database and assign owner
sudo -u postgres createdb -O "$USER" csci3100_p_development || true
# (optional) set postgres password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'pass';"
```

4. Verify you can connect

```bash
# connect using the postgres user (socket)
psql -d csci3100_p_development
# or via TCP
psql -h localhost -U postgres -d csci3100_p_development
```

5. Update Rails configuration (if needed)

Open `config/database.yml` and for the `development` section add or confirm these values if you want TCP connections:

```yaml
development:
  <<: *default
  database: csci3100_p_development
  username: postgres
  password: pass
  host: localhost
```

If you prefer the default Unix socket, you can omit `host`/`username` and Rails will connect via socket to the local `postgres` process.

6. Create and migrate the DB from the Rails app

```bash
# from your repo root
bin/rails db:create
bin/rails db:migrate
# then start the app
bin/dev
```

---

## Option B — Use Docker Postgres (isolated, reproducible)

1. Run Postgres container

```bash
docker run --name csci3100-pg -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=csci3100_p_development -p 5432:5432 -d postgres:15
```

2. Connect from Rails (use TCP host)

Set `host: localhost` in `config/database.yml` or export `DATABASE_URL`:

```bash
export DATABASE_URL="postgres://postgres:pass@localhost:5432/csci3100_p_development"
bin/rails db:create db:migrate
```

3. To remove the container and its data

```bash
docker stop csci3100-pg
docker rm csci3100-pg
# optionally remove image
docker rmi postgres:15
```

> Note: removing the container will delete the container's DB data unless you used a Docker volume.

---

## Syncing with Heroku Postgres

- Pull production DB locally (creates and overwrites local DB):

```bash
heroku pg:pull DATABASE_URL csci3100_p_development --app <your-app-name>
```

- Push local DB to Heroku (DANGEROUS: overwrites remote):

```bash
heroku pg:push csci3100_p_development DATABASE_URL --app <your-app-name>
```

- Backup/restore approach:

```bash
heroku pg:backups:capture --app <your-app-name>
heroku pg:backups:download --app <your-app-name>
pg_restore --verbose --clean --no-acl --no-owner -h localhost -U postgres -d csci3100_p_development latest.dump
```

Always back up production before any restore/push.

---

## Common troubleshooting

- "connection to server on socket \"/var/run/postgresql/.s.PGSQL.5432\" failed": PostgreSQL server is not running or Rails is trying to use a socket while Postgres is only listening on TCP. Start the service, or set `host: localhost` in `config/database.yml`.

- `psql: command not found`: install `postgresql-client` (`sudo apt install -y postgresql-client`) or use the `postgres` user via `sudo -u postgres psql`.

- Port 5432 already in use: check `ss -ltnp | grep 5432` and stop the conflicting service/container.

- Permission / role issues: ensure the DB owner and role names match what Rails expects, or set `username`/`password` in `config/database.yml`.

---

## Quick checklist (one-liners)

- Install and start Postgres:

```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

- Create local role/db and run migrations:

```bash
sudo -u postgres createuser -s "$USER" || true
sudo -u postgres createdb -O "$USER" csci3100_p_development || true
bin/rails db:create db:migrate
```

- If using Docker instead:

```bash
docker run --name csci3100-pg -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=csci3100_p_development -p 5432:5432 -d postgres:15
export DATABASE_URL="postgres://postgres:pass@localhost:5432/csci3100_p_development"
bin/rails db:create db:migrate
```

---

If you want, I can:
- Edit `config/database.yml` to add a `host: localhost` example for `development`, or
- Run the install commands here (needs `sudo`), or
- Create a small `.env` example file for local development.

Tell me which one you'd like next.