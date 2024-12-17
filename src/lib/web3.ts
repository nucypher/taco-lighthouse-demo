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
      id: '0x13881', // Polygon Mumbai (80001 in hex)
      token: 'MATIC',
      label: 'Polygon Mumbai Testnet',
      rpcUrl: 'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID'
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