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

interface SiweOAuthResponse {
  provider: Provider;
  url: string | null;
  properties?: {
    nonce: string;
  };
}

export const connectWallet = async (): Promise<WalletState | null> => {
  let connectedWallet: WalletState | null = null;
  
  try {
    console.log('Starting wallet connection process...');
    
    // First connect the wallet
    connectedWallet = await connectWalletOnly();
    if (!connectedWallet) {
      console.log('No wallet connected during connectWalletOnly');
      return null;
    }

    // Ensure we have a wallet address
    const walletAddress = connectedWallet.accounts?.[0]?.address;
    if (!walletAddress) {
      console.error('No wallet address available after connection');
      throw new Error('No wallet address available');
    }

    // Convert to checksum address before creating message
    const checksumAddress = ethers.utils.getAddress(walletAddress);
    console.log('Using checksum address for SIWE:', checksumAddress);

    // Start SIWE OAuth flow to get nonce
    console.log('Initiating SIWE OAuth flow...');
    const { data: oauthData, error: nonceError } = await supabase.auth.signInWithOAuth({
      provider: 'siwe' as Provider,
      options: {
        skipBrowserRedirect: true
      }
    });

    console.log('OAuth response:', oauthData);

    if (nonceError) {
      console.error('Failed to get nonce:', nonceError);
      throw new Error('Failed to get nonce for SIWE authentication');
    }

    const typedOAuthData = oauthData as SiweOAuthResponse;
    if (!typedOAuthData || !typedOAuthData.properties?.nonce) {
      console.error('No nonce received in OAuth response:', typedOAuthData);
      throw new Error('No nonce received from authentication service');
    }

    const nonce = typedOAuthData.properties.nonce;
    console.log('Got nonce for SIWE message:', nonce);

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
      nonce: nonce
    });

    const messageToSign = message.prepareMessage();
    console.log('Prepared SIWE message:', messageToSign);
    
    console.log('Requesting signature from wallet...');
    const signature = await signer.signMessage(messageToSign);
    console.log('Got signature:', signature);

    // Complete the OAuth flow with the signed message
    console.log('Completing SIWE authentication...');
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

    if (signInError || !signInData) {
      console.error('Failed to sign in:', signInError);
      throw new Error(`SIWE authentication failed: ${signInError?.message || 'Unknown error'}`);
    }

    // Verify the session was created successfully
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Failed to get session after sign in:', sessionError);
      throw new Error(`Session verification failed: ${sessionError.message}`);
    }

    if (!session) {
      console.error('No session created after successful sign in');
      throw new Error('Authentication failed: No session created');
    }

    console.log('Successfully authenticated with SIWE:', {
      userId: session.user.id,
      expiresAt: session.expires_at
    });
    
    return connectedWallet;

  } catch (error) {
    console.error('Wallet connection error:', error);
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