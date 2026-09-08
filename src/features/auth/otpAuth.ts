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

/** Sends a 6-digit email code (not a magic link -- OtpScreen expects a code to type in). */
export async function sendEmailOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verifyEmailOtp(email: string, token: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  if (!data.session) throw new Error('Email verification did not produce a session.');
  return data.session;
}
