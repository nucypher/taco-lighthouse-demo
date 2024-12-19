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

    // Generate nonce using Math.random() and timestamp for uniqueness
    const nonce = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    console.log('Generated nonce:', nonce);

    // Create and sign SIWE message
    const web3Provider = getWeb3Provider();
    const signer = web3Provider.getSigner();
    
    const message = new SiweMessage({
      domain: window.location.host,
      address: checksumAddress,
      statement: 'Sign in with TACo',
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

    // Sign in with custom JWT
    console.log('Signing in with custom JWT...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${checksumAddress.toLowerCase()}@ethereum.org`,
      password: signature,
    });

    if (signInError || !signInData) {
      console.error('Failed to sign in:', signInError);
      throw new Error(`Authentication failed: ${signInError?.message || 'Unknown error'}`);
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

    console.log('Successfully authenticated:', {
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