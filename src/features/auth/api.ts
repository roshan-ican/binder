import { apiFetch } from '../../lib/api';

export type AuthSessionResult = {
  userId: string;
  hasBusiness: boolean;
  businessId: string | null;
};

/**
 * Exchanges a Supabase access token with the Go backend, which verifies it
 * against Supabase's JWKS, upserts a row in our own `users` table, and
 * reports whether this identity already has a `businesses` row — so the
 * client knows whether to route into onboarding or straight into the app.
 */
export async function syncAuthSession(accessToken: string): Promise<AuthSessionResult> {
  const response = await apiFetch('/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Session sync failed (${response.status})`);
  }
  return response.json();
}
