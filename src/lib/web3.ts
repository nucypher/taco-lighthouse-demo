import { 
  connectWalletOnly, 
  disconnectWalletOnly,
  web3Onboard 
} from '@/services/wallet';
import type { WalletState } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { logWalletEvent, storeWalletState } from './wallet-utils';
import { handleSiweAuthentication } from './siwe-utils';

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

    storeWalletState(connectedWallet);

    const walletAddress = connectedWallet.accounts?.[0]?.address;
    if (!walletAddress) {
      throw new Error('No wallet address available');
    }

    await handleSiweAuthentication(walletAddress);
    return connectedWallet;

  } catch (error) {
    logWalletEvent('Wallet connection error:', error);
    storeWalletState(null);
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
  storeWalletState(null);
  logWalletEvent('Wallet disconnected and signed out');
};

export default web3Onboard;