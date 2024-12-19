import { getWeb3Provider } from '@/services/wallet';
import { 
  connectWalletOnly, 
  disconnectWalletOnly,
  web3Onboard 
} from '@/services/wallet';
import type { WalletState } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { Provider } from '@supabase/supabase-js';

export const connectWallet = async (): Promise<WalletState | null> => {
  let connectedWallet: WalletState | null = null;
  
  try {
    console.log('[Web3] Starting wallet connection process...');
    
    // First connect the wallet
    connectedWallet = await connectWalletOnly();
    if (!connectedWallet) {
      console.log('[Web3] No wallet connected after connectWalletOnly');
      return null;
    }

    console.log('[Web3] Wallet connected:', {
      label: connectedWallet.label,
      address: connectedWallet.accounts?.[0]?.address
    });

    // Ensure we have a wallet address
    const walletAddress = connectedWallet.accounts?.[0]?.address;
    if (!walletAddress) {
      console.error('[Web3] No wallet address available');
      throw new Error('No wallet address available');
    }

    // Convert to checksum address before creating message
    const checksumAddress = ethers.utils.getAddress(walletAddress);
    console.log('[Web3] Using checksum address:', checksumAddress);

    // Check current session before proceeding
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('[Web3] Current session state:', {
      hasSession: !!currentSession,
      sessionId: currentSession?.user?.id,
      sessionExp: currentSession?.expires_at
    });

    // Get the nonce from Supabase
    console.log('[Web3] Initiating SIWE OAuth flow to get nonce...');
    const { data: oauthData, error: nonceError } = await supabase.auth.signInWithOAuth({
      provider: 'siwe' as Provider,
      options: {
        skipBrowserRedirect: true
      }
    });

    if (nonceError || !oauthData) {
      console.error('[Web3] Failed to get nonce:', {
        error: nonceError,
        data: oauthData
      });
      throw nonceError;
    }

    console.log('[Web3] Got OAuth data:', {
      hasNonce: !!oauthData.nonce,
      provider: oauthData.provider
    });

    // Create and sign SIWE message
    const web3Provider = getWeb3Provider();
    const signer = web3Provider.getSigner();
    
    const message = new SiweMessage({
      domain: window.location.host,
      address: checksumAddress,
      statement: 'Sign in with Ethereum to TACo',
      uri: window.location.origin,
      version: '1',
      chainId: 1,
      // @ts-ignore - We know this exists in the SIWE flow
      nonce: oauthData.nonce
    });

    const messageToSign = message.prepareMessage();
    console.log('[Web3] Prepared SIWE message:', messageToSign);
    
    console.log('[Web3] Requesting signature from wallet...');
    const signature = await signer.signMessage(messageToSign);
    console.log('[Web3] Got signature:', signature.slice(0, 10) + '...');

    // Complete the OAuth flow with the signed message
    console.log('[Web3] Completing SIWE authentication...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'siwe' as Provider,
      options: {
        skipBrowserRedirect: true,
        queryParams: {
          message: messageToSign,
          signature,
          redirect_to: window.location.origin
        }
      }
    });

    if (signInError) {
      console.error('[Web3] Failed to sign in:', {
        error: signInError,
        data: signInData
      });
      throw signInError;
    }

    // Verify session was created
    const { data: { session: finalSession } } = await supabase.auth.getSession();
    console.log('[Web3] Final session state after SIWE:', {
      hasSession: !!finalSession,
      sessionId: finalSession?.user?.id,
      sessionExp: finalSession?.expires_at,
      accessToken: finalSession?.access_token ? 'present' : 'missing'
    });

    console.log('[Web3] Successfully signed in with SIWE');
    return connectedWallet;

  } catch (error) {
    console.error('[Web3] Connection error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      wallet: connectedWallet?.label
    });
    // Clean up on error
    if (connectedWallet) {
      await disconnectWalletOnly(connectedWallet);
    }
    await supabase.auth.signOut();
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await disconnectWalletOnly(wallet);
  await supabase.auth.signOut();
};

export default web3Onboard;