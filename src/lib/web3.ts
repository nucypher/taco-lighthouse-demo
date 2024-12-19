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

    // Ensure we have a wallet address
    const walletAddress = wallet.accounts?.[0]?.address;
    if (!walletAddress) {
      console.error('No wallet address available');
      throw new Error('No wallet address available');
    }

    // Then check if we already have a session
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    
    // If we have both a wallet and a valid session, verify they match
    if (existingSession?.user) {
      console.log('Existing session found, verifying wallet match...');
      
      // The email in the session is walletAddress@ethereum.local
      const sessionAddress = existingSession.user.email?.split('@')[0];
      const currentWalletAddress = walletAddress.toLowerCase();
      
      if (sessionAddress === currentWalletAddress) {
        console.log('Wallet matches session, proceeding...');
        return wallet;
      } else {
        console.log('Wallet does not match session, signing out...', {
          sessionAddress,
          currentWalletAddress
        });
        await signOut();
      }
    }

    console.log('No valid session, proceeding with SIWE');
    const web3Provider = getWeb3Provider();
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    
    const { message, signature } = await signInWithEthereum(address);
    const authResponse = await authenticateWithSupabase(address, message, signature);

    if (!authResponse?.session) {
      console.error('Failed to authenticate with Supabase');
      throw new Error('Authentication failed');
    }

    console.log('SIWE authentication successful, session created:', authResponse.session.user.id);
    await setSupabaseSession(authResponse.session);

    return wallet;
  } catch (error) {
    console.error('Connection error:', error);
    // Clean up on error
    await signOut();
    await disconnectWalletOnly(wallet);
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await disconnectWalletOnly(wallet);
  await signOut();
};

export default web3Onboard;