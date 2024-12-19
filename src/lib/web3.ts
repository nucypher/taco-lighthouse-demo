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
  let connectedWallet: WalletState | null = null;
  
  try {
    // First connect the wallet
    connectedWallet = await connectWalletOnly();
    if (!connectedWallet) return null;

    // Ensure we have a wallet address
    const walletAddress = connectedWallet.accounts?.[0]?.address;
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
        return connectedWallet;
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

    console.log('SIWE authentication successful');

    // Set the session with the tokens from the edge function response
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: authResponse.session.access_token,
      refresh_token: authResponse.session.refresh_token
    });

    if (sessionError) {
      console.error('Failed to set session:', sessionError);
      throw sessionError;
    }

    // Verify session was set successfully
    const { data: { session: verifySession } } = await supabase.auth.getSession();
    if (!verifySession) {
      throw new Error('Session verification failed after setting');
    }

    console.log('Session set successfully:', {
      userId: session.user.id,
      email: session.user.email
    });

    return connectedWallet;
  } catch (error) {
    console.error('Connection error:', error);
    // Clean up on error
    if (connectedWallet) {
      await disconnectWalletOnly(connectedWallet);
    }
    await signOut();
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await disconnectWalletOnly(wallet);
  await signOut();
};

export default web3Onboard;