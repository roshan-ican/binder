import { supabase } from '../../lib/supabase';

export { signInWithGoogle } from './googleAuth';
export { verifyEmailOtp, verifyPhoneOtp } from './otpAuth';

/** Supabase owns authentication; Go account sync is a separate business operation. */
export async function restoreAuthSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}
