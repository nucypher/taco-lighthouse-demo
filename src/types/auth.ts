import { User } from '@supabase/supabase-js'

export interface WalletState {
  label?: string;
  accounts?: { address: string }[];
}

export interface SiweAuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface SignInResult {
  message: string;
  signature: string;
}