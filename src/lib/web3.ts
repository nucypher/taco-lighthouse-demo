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
    '--w3o-background-color': 'hsl(var(--background))',
    '--w3o-foreground-color': 'hsl(var(--foreground))',
    '--w3o-text-color': 'hsl(var(--foreground))',
    '--w3o-border-color': 'hsl(var(--border))',
    '--w3o-action-color': 'hsl(var(--primary))',
    '--w3o-border-radius': '0.25rem',
    '--w3o-font-family': '"Fira Code", monospace',
    '--w3o-modal-z-index': '100',
    '--w3o-modal-backdrop-background': 'rgba(0, 0, 0, 0.2)',
    '--w3o-modal-background': 'hsl(var(--background))',
    '--w3o-modal-color': 'hsl(var(--foreground))',
    '--w3o-modal-border-color': 'hsl(var(--border))',
    '--w3o-button-border-radius': '0.25rem',
    '--w3o-button-hover-background-color': 'hsl(var(--primary))',
    '--w3o-button-hover-color': 'hsl(var(--primary-foreground))',
    '--w3o-button-background-color': 'transparent',
    '--w3o-button-color': 'hsl(var(--foreground))',
    '--w3o-button-border-color': 'hsl(var(--border))',
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