import Onboard from '@web3-onboard/core';
import walletConnectModule from '@web3-onboard/walletconnect';
import injectedModule from '@web3-onboard/injected-wallets';

const walletConnect = walletConnectModule({
  projectId: 'c5d90293c2ddcb8e467deb6484b19f9b',
});

const injected = injectedModule();

const web3Onboard = Onboard({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0x1', // Ethereum Mainnet
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
    }
  ],
  appMetadata: {
    name: 'D-Sound',
    icon: '/favicon.ico',
    description: 'Decentralized Sound Platform'
  },
  theme: {
    '--onboard-font-family-normal': '"Fira Code", monospace',
    '--onboard-font-family-semibold': '"Fira Code", monospace',
    '--onboard-font-family-light': '"Fira Code", monospace',
    '--onboard-modal-z-index': '100',
    '--onboard-modal-backdrop': 'rgba(0, 0, 0, 0.2)',
    '--onboard-modal-border-radius': '0.25rem',
    '--onboard-modal-background': 'hsl(var(--background))',
    '--onboard-modal-color': 'hsl(var(--foreground))',
    '--onboard-modal-border-color': 'hsl(var(--border))',
    '--onboard-primary-100': 'hsl(var(--primary))',
    '--onboard-primary-200': 'hsl(var(--primary))',
    '--onboard-primary-300': 'hsl(var(--primary))',
    '--onboard-primary-400': 'hsl(var(--primary))',
    '--onboard-primary-500': 'hsl(var(--primary))',
    '--onboard-primary-600': 'hsl(var(--primary))',
    '--onboard-primary-700': 'hsl(var(--primary))',
    '--onboard-text-color': 'hsl(var(--foreground))',
    '--onboard-main-background': 'hsl(var(--background))',
    '--onboard-close-button-background': 'transparent',
    '--onboard-close-button-color': 'hsl(var(--foreground))',
    '--onboard-button-background': 'transparent',
    '--onboard-button-background-hover': 'hsl(var(--primary))',
    '--onboard-button-color': 'hsl(var(--foreground))',
    '--onboard-button-color-hover': 'hsl(var(--primary-foreground))',
    '--onboard-button-border-color': 'hsl(var(--border))',
    '--onboard-button-border-radius': '0.25rem'
  }
});

export const connectWallet = async () => {
  const wallets = await web3Onboard.connectWallet();
  return wallets[0];
};

export const disconnectWallet = async (wallet: any) => {
  await web3Onboard.disconnectWallet(wallet);
};

export default web3Onboard;