import init from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { ethers } from 'ethers';
import { WalletState } from '@/types/auth';

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: 'c5d90293c2ddcb8e467deb6484b19f9b'
});

export const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/',
    },
    {
      id: '0xaa36a7',
      token: 'ETH',
      label: 'Sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/',
    },
  ],
  appMetadata: {
    name: 'TACo',
    icon: '/favicon.ico',
    description: 'Decentralized Music Platform',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
  connect: {
    autoConnectLastWallet: true
  }
});

export const getWeb3Provider = (): ethers.providers.Web3Provider => {
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const connectWalletOnly = async (): Promise<WalletState | null> => {
  console.log('[WALLET] Attempting to connect wallet...');
  try {
    const wallets = await web3Onboard.connectWallet();
    if (!wallets[0]) {
      console.log('[WALLET] No wallet connected');
      return null;
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('[WALLET] Wallet connected successfully:', wallets[0]);
    return wallets[0];
  } catch (error) {
    console.error('[WALLET] Error connecting wallet:', error);
    return null;
  }
};

export const disconnectWalletOnly = async (wallet: WalletState) => {
  console.log('[WALLET] Disconnecting wallet:', wallet);
  if (wallet.label) {
    await web3Onboard.disconnectWallet({ label: wallet.label });
  }
};