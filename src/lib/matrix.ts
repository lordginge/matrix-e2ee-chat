import { createClient, MatrixClient } from "matrix-js-sdk";

const KEYS = {
  baseUrl: "e2ee_chat.base_url",
  accessToken: "e2ee_chat.access_token",
  userId: "e2ee_chat.user_id",
  deviceId: "e2ee_chat.device_id",
} as const;

export interface SavedSession {
  baseUrl: string;
  accessToken: string;
  userId: string;
  deviceId: string;
}

export function loadSession(): SavedSession | null {
  const accessToken = localStorage.getItem(KEYS.accessToken);
  const userId = localStorage.getItem(KEYS.userId);
  const deviceId = localStorage.getItem(KEYS.deviceId);
  const baseUrl = localStorage.getItem(KEYS.baseUrl);
  if (!accessToken || !userId || !deviceId || !baseUrl) return null;
  return { baseUrl, accessToken, userId, deviceId };
}

export function saveSession(s: SavedSession) {
  localStorage.setItem(KEYS.baseUrl, s.baseUrl);
  localStorage.setItem(KEYS.accessToken, s.accessToken);
  localStorage.setItem(KEYS.userId, s.userId);
  localStorage.setItem(KEYS.deviceId, s.deviceId);
}

export function clearSession() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function normalizeBaseUrl(input: string): string {
  let url = input.trim();
  if (!url) url = "https://matrix.org";
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url.replace(/\/+$/, "");
}

/**
 * Initialize end-to-end encryption (Rust crypto: Olm/Megolm) and start syncing.
 */
export async function bootstrapClient(client: MatrixClient): Promise<void> {
  await client.initRustCrypto();
  client.startClient({ initialSyncLimit: 30, lazyLoadMembers: true });
}

export async function loginWithPassword(
  baseUrl: string,
  username: string,
  password: string,
): Promise<MatrixClient> {
  const loginClient = createClient({ baseUrl });
  const res = await loginClient.login("m.login.password", {
    identifier: { type: "m.id.user", user: username },
    password,
    initial_device_display_name: "E2EE Chat (Web)",
  });

  const session: SavedSession = {
    baseUrl,
    accessToken: res.access_token,
    userId: res.user_id,
    deviceId: res.device_id,
  };
  saveSession(session);
  return createClientFromSession(session);
}

export async function createClientFromSession(s: SavedSession): Promise<MatrixClient> {
  const client = createClient({
    baseUrl: s.baseUrl,
    accessToken: s.accessToken,
    userId: s.userId,
    deviceId: s.deviceId,
    useAuthorizationHeader: true,
  });
  await bootstrapClient(client);
  return client;
}
