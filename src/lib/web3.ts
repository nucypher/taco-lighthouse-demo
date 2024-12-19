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

function logWalletEvent(event: string, data?: any) {
  console.log(`[WALLET] ${event}`, data ? data : '');
}

async function createAndSignSiweMessage(walletAddress: string, nonce: string) {
  const web3Provider = getWeb3Provider();
  const signer = web3Provider.getSigner();
  
  const message = new SiweMessage({
    domain: window.location.host,
    address: ethers.utils.getAddress(walletAddress),
    statement: 'Sign in with TACo',
    uri: window.location.origin,
    version: '1',
    chainId: 1,
    nonce: nonce
  });

  const messageToSign = message.prepareMessage();
  logWalletEvent('Prepared SIWE message:', messageToSign);
  
  const signature = await signer.signMessage(messageToSign);
  logWalletEvent('Got signature:', signature);

  return { messageToSign, signature };
}

export const connectWallet = async (): Promise<WalletState | null> => {
  try {
    logWalletEvent('Starting wallet connection process...');
    logWalletEvent('Current localStorage state:', localStorage.getItem('connectedWallet'));
    
    const connectedWallet = await connectWalletOnly();
    logWalletEvent('Initial wallet connection result:', connectedWallet);
    
    if (!connectedWallet) {
      logWalletEvent('No wallet connected during connectWalletOnly');
      return null;
    }

    // Store the wallet state in localStorage to persist it
    localStorage.setItem('connectedWallet', JSON.stringify(connectedWallet));
    logWalletEvent('Stored wallet state in localStorage:', connectedWallet);

    const walletAddress = connectedWallet.accounts?.[0]?.address;
    if (!walletAddress) {
      throw new Error('No wallet address available');
    }

    // Get nonce from edge function
    logWalletEvent('Requesting nonce from edge function...');
    const { data: nonce, error: nonceError } = await supabase.functions.invoke('nonce');
    
    if (nonceError || !nonce) {
      throw new Error('Failed to get nonce for authentication');
    }
    
    logWalletEvent('Received nonce from edge function:', nonce);

    // Create and sign SIWE message
    const { messageToSign, signature } = await createAndSignSiweMessage(walletAddress, nonce);

    // Call the SIWE auth edge function
    logWalletEvent('Calling SIWE auth edge function...');
    const redirectUrl = 'http://localhost:8080';
    
    const { data: authData, error: authError } = await supabase.functions.invoke('siwe-auth', {
      body: { 
        address: ethers.utils.getAddress(walletAddress),
        message: messageToSign,
        signature,
        redirect_url: redirectUrl
      }
    });

    if (authError) {
      throw new Error(`SIWE authentication failed: ${authError.message || 'Unknown error'}`);
    }

    logWalletEvent('SIWE auth successful, received data:', authData);

    if (authData?.session?.action_link) {
      logWalletEvent('Redirecting to action link for authentication...');
      window.location.href = authData.session.action_link;
    } else {
      throw new Error('Authentication failed: No action link received');
    }

    return connectedWallet;

  } catch (error) {
    logWalletEvent('Wallet connection error:', error);
    localStorage.removeItem('connectedWallet');
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during wallet connection');
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  logWalletEvent('Disconnecting wallet:', wallet);
  await disconnectWalletOnly(wallet);
  await supabase.auth.signOut();
  localStorage.removeItem('connectedWallet');
  logWalletEvent('Wallet disconnected and signed out');
};

export default web3Onboard;