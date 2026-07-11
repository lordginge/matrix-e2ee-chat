# Matrix E2EE Chat

An end-to-end encrypted chat web app built on the [Matrix](https://matrix.org) protocol.

Encryption is handled client-side with the official [`matrix-js-sdk`](https://github.com/matrix-org/matrix-js-sdk) and its Rust crypto stack (Olm for one-to-one key exchange, Megolm for group sessions) — messages are encrypted in your browser before they ever reach the homeserver.

## Features

- Sign in to **any Matrix homeserver** (defaults to matrix.org)
- **End-to-end encryption** via `initRustCrypto()` (Olm/Megolm, IndexedDB-backed key store)
- Room list with encryption indicators and invite accept/decline
- Create new **encrypted direct chats** by Matrix ID
- Real-time message timeline with automatic decryption
- Graceful handling of undecryptable messages (missing historical keys)
- Session persistence across reloads (access token + device ID in localStorage, crypto keys in IndexedDB)
- Dark, security-focused UI (React + TypeScript + Tailwind + shadcn/ui)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in dist/
```

You need a Matrix account — create one free at [app.element.io](https://app.element.io) (or any public homeserver), then sign in here with the same credentials. Devices/keys are managed by the SDK's Rust crypto layer.

## How it works

1. **Login** — `m.login.password` against the chosen homeserver; a new device is registered.
2. **Crypto bootstrap** — `client.initRustCrypto()` loads the wasm crypto module, creates/restores the Olm account and uploads device keys.
3. **Sync** — `/sync` long-polling delivers timeline events; encrypted events (`m.room.encrypted`) are decrypted in-browser as keys arrive.
4. **Sending** — in rooms with `m.room.encryption` state, outgoing messages are encrypted with Megolm for all participant devices.

## Project structure

```
src/
  lib/matrix.ts              # session persistence, login, client bootstrap
  hooks/useMatrixClient.tsx  # auth context + sync state
  hooks/useRooms.ts          # joined/invited room list
  hooks/useTimeline.ts       # live timeline + back-pagination
  pages/Login.tsx            # homeserver + credentials form
  pages/Chat.tsx             # main layout
  components/chat/           # room list, messages, composer, new-chat dialog
```

## Notes & limitations

- This is a lightweight client, not a full Element replacement: no key backup/secret-storage recovery flow yet, so messages sent *before* you joined (or from sessions whose keys you don't have) show as "unable to decrypt".
- The wasm crypto bundle is ~5 MB; it is gzip-compressed in production builds.
