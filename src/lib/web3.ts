import Onboard from '@web3-onboard/core';
import walletConnectModule from '@web3-onboard/walletconnect';

const walletConnect = walletConnectModule({
  projectId: 'YOUR_PROJECT_ID', // You'll need to get this from WalletConnect
});

const web3Onboard = Onboard({
  wallets: [walletConnect],
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