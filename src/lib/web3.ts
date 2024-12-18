import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';

const injected = injectedModule();
const walletConnect = walletConnectModule();

interface WalletState {
  label: string;
  accounts: { address: string }[];
}

const web3Onboard = init({
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
});

export const connectWallet = async (): Promise<WalletState | null> => {
  const wallets = await web3Onboard.connectWallet();
  return wallets[0] || null;
};

export const disconnectWallet = async (wallet: WalletState) => {
  await web3Onboard.disconnectWallet(wallet);
};

export default web3Onboard;