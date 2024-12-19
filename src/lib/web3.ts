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
    // First connect the wallet
    const wallet = await connectWalletOnly();
    if (!wallet) return null;

    // Then check if we already have a session
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    
    // If we have both a wallet and a valid session, we're done
    if (existingSession && wallet.accounts?.[0]?.address) {
      console.log('Existing session found, verifying wallet match...');
      
      // Verify the connected wallet matches the session
      const sessionAddress = existingSession.user.email?.split('@')[0];
      const walletAddress = wallet.accounts[0].address.toLowerCase();
      
      if (sessionAddress === walletAddress) {
        console.log('Wallet matches session, proceeding...');
        return wallet;
      } else {
        console.log('Wallet does not match session, signing out...');
        await signOut();
      }
    }

    console.log('No valid session, proceeding with SIWE');
    const web3Provider = getWeb3Provider();
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    
    const { message, signature } = await signInWithEthereum(address);
    const authResponse = await authenticateWithSupabase(address, message, signature);

    if (authResponse?.session) {
      await setSupabaseSession(authResponse.session);
      console.log('SIWE authentication successful');
    } else {
      console.error('Failed to authenticate with Supabase');
      throw new Error('Authentication failed');
    }

    return wallet;
  } catch (error) {
    console.error('Connection error:', error);
    // Clean up on error
    await signOut();
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await disconnectWalletOnly(wallet);
  await signOut();
};

export default web3Onboard;