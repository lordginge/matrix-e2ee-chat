# Self-hosting guide

Run your own Matrix homeserver (you're the admin, accounts are invite-only)
plus this E2EE web client — usable from desktop and mobile browsers, or from
Element mobile apps pointed at your server.

## Architecture

```
Phone / Browser  ──HTTPS──>  Caddy or nginx (TLS)
                                ├── /_matrix/*  ──>  Synapse (your homeserver)
                                └── /           ──>  This web client (static)
```

One domain serves both, so there are no CORS issues. Mobile users open the
same URL and can "Add to Home Screen" for an app-like experience.

## 1. What you need

- A VPS (1 vCPU / 1 GB RAM is enough for a small private server)
- A domain, e.g. `chat.example.com`, with an **A record pointing to the VPS**
- Docker + Docker Compose plugin installed on the VPS

## 2. Get the code onto the server

```bash
git clone https://github.com/<you>/matrix-e2ee-chat.git
cd matrix-e2ee-chat/deploy
cp .env.example .env
# edit .env: set SYNAPSE_SERVER_NAME and VITE_DEFAULT_HOMESERVER to your domain
```

## 3. Generate the Synapse config (first run only)

```bash
source .env
docker run --rm \
  -v "$PWD/synapse-data:/data" \
  -e SYNAPSE_SERVER_NAME="$SYNAPSE_SERVER_NAME" \
  -e SYNAPSE_REPORT_STATS=no \
  ghcr.io/element-hq/synapse:latest generate
```

Then make your server **invite-only** and harden it — edit
`synapse-data/homeserver.yaml`:

```yaml
enable_registration: false            # only you can create accounts
enable_registration_without_verification: false
registration_shared_secret: "<generate: openssl rand -hex 32>"
```

While you're in there, generate fresh secrets if you prefer, but the
`generate` step already created secure ones.

## 4. Start everything

```bash
docker compose up -d --build
```

- Synapse listens on `127.0.0.1:8008`
- The web client is built (with your homeserver as the default) and served on `127.0.0.1:8080`

## 5. Put TLS in front (pick one)

**Caddy (easiest — automatic Let's Encrypt certs):**

```bash
sudo apt install caddy
sudo cp Caddyfile /etc/caddy/Caddyfile   # edit the domain first
sudo systemctl reload caddy
```

**nginx + certbot:** install certbot, get a cert for your domain, then adapt
`nginx.conf` and place it in `/etc/nginx/sites-enabled/`.

Verify: `curl https://chat.example.com/_matrix/client/versions` should return JSON.

## 6. Create your admin account

With registration disabled, accounts are created via the shared secret:

```bash
docker compose exec synapse register_new_matrix_user \
  -c /data/homeserver.yaml http://localhost:8008 \
  --user yourname --password 'a-strong-password' --admin
```

`--admin` makes you a **server admin** (access to the Synapse Admin API:
manage users, reset passwords, shut down rooms, etc.).

Create accounts for friends/family the same way, without `--admin`.

## 7. Log in

- **Desktop / mobile web:** open `https://chat.example.com`, sign in with
  `@yourname:chat.example.com` (or just `yourname`).
- **Mobile apps:** install **Element** (iOS/Android), choose "Sign in →
  Edit homeserver → `https://chat.example.com`". Same account, messages
  stay end-to-end encrypted; each device gets its own keys.

## 8. Admin day-to-day

| Task | Command / API |
|---|---|
| Add a user | `register_new_matrix_user ... --user bob` |
| Reset a password | same command with `--user bob --password ...` (no `--admin`) |
| Make someone admin | same command with `--admin` |
| Admin API | `/_synapse/admin/v1/...` with your access token |
| Backups | back up `deploy/synapse-data/` (config, media, SQLite/Postgres) |

Optional: use the community [synapse-admin](https://github.com/etkecc/synapse-admin)
web UI for point-and-click user management.

## 9. Federation (optional)

By default your server can federate with the wider Matrix network (port 8448
or a `.well-known/matrix/server` file on your domain). For a purely private
server, leave federation unconfigured — nothing else is required.

## Security checklist

- [ ] `enable_registration: false` (done in step 3)
- [ ] Strong, unique `registration_shared_secret`
- [ ] TLS everywhere (step 5) — never expose Synapse without it
- [ ] Firewall: only 80/443 inbound
- [ ] Regular backups of `synapse-data/`
- [ ] Keep images updated: `docker compose pull && docker compose up -d`
