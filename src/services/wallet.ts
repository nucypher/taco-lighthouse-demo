import { ethers } from 'ethers';
import type { WalletState } from '@/types/auth';

export const getWeb3Provider = (): ethers.providers.Web3Provider => {
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const connectWalletOnly = async (): Promise<WalletState | null> => {
  console.log('[WALLET] This function is deprecated. Use Privy hooks instead.');
  return null;
};

export const disconnectWalletOnly = async (wallet: WalletState) => {
  console.log('[WALLET] This function is deprecated. Use Privy hooks instead.');
};