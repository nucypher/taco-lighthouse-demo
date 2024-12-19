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

async function createSiweMessage(address: string, statement: string) {
  try {
    console.log('Fetching nonce from Supabase function...');
    const { data, error } = await supabase.functions.invoke('nonce');
    
    if (error) {
      console.error('Error fetching nonce:', error);
      throw error;
    }

    console.log('Received nonce:', data);
    
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement,
      uri: window.location.origin,
      version: '1',
      chainId: 1,
      nonce: data
    });
    return message.prepareMessage();
  } catch (error) {
    console.error('Error creating SIWE message:', error);
    throw error;
  }
}

async function signInWithEthereum(address: string) {
  try {
    // Create SIWE message
    const message = await createSiweMessage(
      address,
      'Sign in with Ethereum to TACo'
    );
    console.log('Prepared message:', message);

    // Get the provider and signer
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();

    // Request signature from user
    console.log('Requesting signature...');
    const signature = await signer.signMessage(message);
    console.log('Signature received:', signature);

    return { message, signature };
  } catch (error) {
    console.error('Error in signInWithEthereum:', error);
    throw error;
  }
}

async function authenticateWithSupabase(address: string, message: string, signature: string) {
  try {
    console.log('Authenticating with Supabase...', { address, message, signature });
    const { data, error } = await supabase.functions.invoke('siwe-auth', {
      body: { address, message, signature }
    });

    if (error) {
      console.error('Authentication error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in authenticateWithSupabase:', error);
    throw error;
  }
}

export const connectWallet = async (): Promise<WalletState | null> => {
  try {
    console.log('Connecting wallet...');
    const wallets = await web3Onboard.connectWallet();
    if (!wallets[0]) {
      console.log('No wallet connected');
      return null;
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('Connected wallet address:', address);
    
    const { message, signature } = await signInWithEthereum(address);
    console.log('SIWE message signed:', { message, signature });
    
    const authResponse = await authenticateWithSupabase(address, message, signature);
    console.log('Authenticated with Supabase successfully');
    
    // Set the session in Supabase client
    const { session } = authResponse;
    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }

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