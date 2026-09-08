import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

// Required once so the auth browser session resolves correctly on web.
WebBrowser.maybeCompleteAuthSession();

/**
 * Runs Supabase's Google OAuth flow via an in-app browser and returns the
 * resulting Supabase session. The redirect URI (`binder://auth-callback` in
 * a standalone/dev-client build) must be added to this project's
 * Authentication > URL Configuration > Redirect URLs in the Supabase
 * dashboard, or Supabase will refuse the redirect.
 */
export async function signInWithGoogle(): Promise<Session> {
  const redirectTo = Linking.createURL('auth-callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase did not return a Google auth URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in was cancelled.');
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode) throw new Error(errorCode);

  const { access_token: accessToken, refresh_token: refreshToken } = params;
  if (!accessToken || !refreshToken) {
    throw new Error('Google sign-in did not return session tokens.');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new Error('Google sign-in did not produce a session.');

  return sessionData.session;
}
