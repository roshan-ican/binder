import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

/** Sends a 6-digit SMS code. `phoneE164` must be in E.164 form, e.g. "+919876543210". */
export async function sendPhoneOtp(phoneE164: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone: phoneE164 });
  if (error) throw error;
}

export async function verifyPhoneOtp(phoneE164: string, token: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({ phone: phoneE164, token, type: 'sms' });
  if (error) throw error;
  if (!data.session) throw new Error('Phone verification did not produce a session.');
  return data.session;
}

/**
 * Sends a magic link to `email`. Email sign-in is link-based, not code-based:
 * the user taps the link in their inbox and lands back on the app with tokens
 * in the redirect URL, which `sessionFromRedirectUrl` exchanges for a session.
 */
export async function sendEmailMagicLink(email: string): Promise<void> {
  // Without this, Supabase falls back to the project's Site URL -- the deployed
  // site -- even when the link was requested from a local dev server.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: Linking.createURL('auth-callback') },
  });
  if (error) throw error;
}

/**
 * Turns a returning auth redirect (magic link or OAuth) into a session.
 * Returns null when the URL carries no tokens, so callers can ignore the
 * ordinary deep links that also flow through this handler.
 */
export async function sessionFromRedirectUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token: accessToken, refresh_token: refreshToken } = params;
  if (!accessToken || !refreshToken) return null;

  const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (error) throw error;
  return data.session;
}
