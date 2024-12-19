import init from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: 'c5d90293c2ddcb8e467deb6484b19f9b'
});

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
  appMetadata: {
    name: 'TACo',
    icon: '/favicon.ico',
    description: 'Decentralized Music Platform',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  }
});

async function signInWithEthereum(address: string) {
  const nonce = Math.floor(Math.random() * 1000000).toString();
  
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement: 'Sign in with Ethereum to TACo',
    uri: window.location.origin,
    version: '1',
    chainId: 1,
    nonce,
  });

  const messageToSign = message.prepareMessage();
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = web3Provider.getSigner();
  const signature = await signer.signMessage(messageToSign);

  return { message: messageToSign, signature };
}

async function authenticateWithSupabase(address: string, message: string, signature: string) {
  const { data, error } = await supabase.functions.invoke('siwe-auth', {
    body: { address, message, signature }
  });

  if (error) {
    console.error('Authentication error:', error);
    throw error;
  }

  return data;
}

export const connectWallet = async (): Promise<WalletState | null> => {
  try {
    const wallets = await web3Onboard.connectWallet();
    if (!wallets[0]) return null;

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('Connected wallet address:', address);
    
    const { message, signature } = await signInWithEthereum(address);
    console.log('SIWE message signed:', { message, signature });
    
    await authenticateWithSupabase(address, message, signature);
    console.log('Authenticated with Supabase successfully');

    return wallets[0];
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await web3Onboard.disconnectWallet(wallet);
  await supabase.auth.signOut();
};

export default web3Onboard;