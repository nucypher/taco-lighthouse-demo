import { getWeb3Provider } from '@/services/wallet';
import { 
  signInWithEthereum, 
  authenticateWithSupabase, 
  setSupabaseSession,
  signOut
} from '@/services/auth';
import { 
  connectWalletOnly, 
  disconnectWalletOnly,
  web3Onboard 
} from '@/services/wallet';
import type { WalletState } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const connectWallet = async (): Promise<WalletState | null> => {
  try {
    // First check if we already have a session
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    
    // Connect wallet regardless of session status
    const wallet = await connectWalletOnly();
    if (!wallet) return null;

    // If we already have a valid session, just return the wallet
    if (existingSession) {
      console.log('Existing session found, skipping SIWE');
      return wallet;
    }

    console.log('No existing session, proceeding with SIWE');
    const web3Provider = getWeb3Provider();
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    
    const { message, signature } = await signInWithEthereum(address);
    const authResponse = await authenticateWithSupabase(address, message, signature);

    if (authResponse?.session) {
      await setSupabaseSession(authResponse.session);
      console.log('SIWE authentication successful');
    }

    return wallet;
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await disconnectWalletOnly(wallet);
  await signOut();
};

export default web3Onboard;