export interface RevealPayload {
  v: 1;
  giver: string;
  recipient: string;
  eventName: string;
  budget: string;
  exchangeDate: string;
  hostNote: string;
  nonReciprocal: boolean;
  createdAt: string;
}

export interface BlindLedgerEntry {
  giver: string;
  revealUrl: string;
  shareMessage: string;
  sent: boolean;
}

export interface BlindBackupFile {
  app: 'Hearth & Seal';
  version: 1;
  eventName: string;
  exchangeDate: string;
  budget: string;
  createdAt: string;
  entries: Array<{
    giver: string;
    revealUrl: string;
  }>;
}

const TOKEN_VERSION = 1;
const IV_LENGTH = 12;
const KEY_LENGTH = 16; // 128-bit AES-GCM key

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): Uint8Array {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((encoded.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function sealRevealPayload(payload: RevealPayload): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }

  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 128 },
    true,
    ['encrypt', 'decrypt']
  );

  const rawKeyBuffer = await window.crypto.subtle.exportKey('raw', key);
  const rawKey = new Uint8Array(rawKeyBuffer);
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(payload));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );
  const ciphertext = new Uint8Array(ciphertextBuffer);

  const packed = new Uint8Array(1 + IV_LENGTH + KEY_LENGTH + ciphertext.length);
  packed[0] = TOKEN_VERSION;
  packed.set(iv, 1);
  packed.set(rawKey, 1 + IV_LENGTH);
  packed.set(ciphertext, 1 + IV_LENGTH + KEY_LENGTH);

  return toBase64Url(packed);
}

export async function unsealRevealToken(token: string): Promise<RevealPayload> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }

  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Missing invite token.');
  }

  let packed: Uint8Array;
  try {
    packed = fromBase64Url(cleanToken);
  } catch {
    throw new Error('This invite link appears malformed or truncated.');
  }

  const minLength = 1 + IV_LENGTH + KEY_LENGTH + 16; // includes 16-byte GCM tag
  if (packed.length < minLength || packed[0] !== TOKEN_VERSION) {
    throw new Error('This invite link could not be verified.');
  }

  const iv = packed.slice(1, 1 + IV_LENGTH);
  const rawKey = packed.slice(1 + IV_LENGTH, 1 + IV_LENGTH + KEY_LENGTH);
  const ciphertext = packed.slice(1 + IV_LENGTH + KEY_LENGTH);

  let parsed: unknown;
  try {
    const key = await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const plaintextBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    parsed = JSON.parse(decoder.decode(plaintextBuffer));
  } catch {
    throw new Error('This invite link is incomplete or was altered.');
  }

  const candidate = parsed as Partial<RevealPayload>;
  if (
    candidate.v !== 1 ||
    typeof candidate.giver !== 'string' ||
    typeof candidate.recipient !== 'string' ||
    !candidate.giver.trim() ||
    !candidate.recipient.trim()
  ) {
    throw new Error('This invite link does not contain a valid Secret Santa letter.');
  }

  return {
    v: 1,
    giver: candidate.giver,
    recipient: candidate.recipient,
    eventName: typeof candidate.eventName === 'string' && candidate.eventName.trim() ? candidate.eventName : 'Secret Santa Exchange',
    budget: typeof candidate.budget === 'string' ? candidate.budget : '',
    exchangeDate: typeof candidate.exchangeDate === 'string' ? candidate.exchangeDate : '',
    hostNote: typeof candidate.hostNote === 'string' ? candidate.hostNote : '',
    nonReciprocal: Boolean(candidate.nonReciprocal),
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : '',
  };
}

export function buildInviteMessage(
  giver: string,
  eventName: string,
  revealUrl: string
): string {
  const title = eventName.trim() || 'our Secret Santa';
  return `Hi ${giver}! You're invited to ${title}. Open your private sealed letter here (only you can see who you drew): ${revealUrl}`;
}

export function extractTokenFromHash(hash: string): string | null {
  if (!hash) return null;
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!trimmed.startsWith('reveal=')) return null;
  const rawToken = trimmed.slice('reveal='.length);
  return rawToken ? decodeURIComponent(rawToken) : null;
}

export function buildRevealUrl(baseUrl: string, token: string): string {
  const cleanBase = baseUrl.split('#')[0].split('?')[0].trim();
  const normalizedBase = cleanBase || `${window.location.origin}${window.location.pathname}`;
  return `${normalizedBase}#reveal=${token}`;
}
