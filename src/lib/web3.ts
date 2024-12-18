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
    description: 'Decentralized Music Platform'
  }
});

export const createSiweMessage = (address: string, chainId: number) => {
  const now = new Date();
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement: 'Sign in with Ethereum to TACo',
    uri: window.location.origin,
    version: '1',
    chainId,
    nonce: Math.random().toString(36).substring(2, 15),
    issuedAt: now.toISOString(),
    expirationTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  });
  return message.prepareMessage();
};

const createPasswordFromSignature = (signature: string, address: string) => {
  // Create a deterministic password by combining the signature with the address
  // and taking the first 72 characters of the hash
  return ethers.utils.id(signature + address).slice(0, 72);
};

export const connectWallet = async (): Promise<WalletState | null> => {
  try {
    const wallets = await web3Onboard.connectWallet();
    if (!wallets[0]) return null;

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    const chainId = (await web3Provider.getNetwork()).chainId;

    // Create and sign SIWE message
    const message = createSiweMessage(address, chainId);
    const signature = await signer.signMessage(message);
    
    // Create a password that's less than 72 characters
    const password = createPasswordFromSignature(signature, address);

    // Try to sign up first (for new users)
    const { error: signUpError } = await supabase.auth.signUp({
      email: `${address.toLowerCase()}@ethereum.org`,
      password: password,
    });

    // If sign up fails (user exists), try to sign in
    if (signUpError) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${address.toLowerCase()}@ethereum.org`,
        password: password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }
    }

    return wallets[0];
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
};

export const disconnectWallet = async (wallet: WalletState) => {
  await web3Onboard.disconnectWallet(wallet);
};

export default web3Onboard;