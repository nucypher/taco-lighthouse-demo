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

const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15);
};

export const createSiweMessage = (address: string, chainId: number, nonce: string) => {
  const now = new Date();
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement: 'Sign in with Ethereum to TACo',
    uri: window.location.origin,
    version: '1',
    chainId,
    nonce,
    issuedAt: now.toISOString(),
    expirationTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  });
  return message.prepareMessage();
};

export const connectWallet = async (): Promise<WalletState | null> => {
  try {
    const wallets = await web3Onboard.connectWallet();
    if (!wallets[0]) return null;

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    const chainId = (await web3Provider.getNetwork()).chainId;
    const nonce = generateNonce();

    // Create and sign SIWE message
    const message = createSiweMessage(address, chainId, nonce);
    const signature = await signer.signMessage(message);

    // Create a JWT token using the SIWE message and signature
    const { data: { session }, error: signInError } = await supabase.auth.signInWithJwt({
      jwt: signature,
      nonce: nonce,
    });

    if (signInError || !session) {
      console.error('Sign in error:', signInError);
      throw signInError || new Error('No session created');
    }

    // Get or create user record
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('address', address.toLowerCase())
      .maybeSingle();

    if (queryError) {
      console.error('Error querying user:', queryError);
      throw new Error('Failed to check user existence');
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          address: address.toLowerCase(),
          auth: { 
            lastAuth: new Date().toISOString(),
            lastAuthStatus: 'success',
            genNonce: nonce 
          }
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        throw new Error('Failed to create user record');
      }
    } else {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          auth: { 
            lastAuth: new Date().toISOString(),
            lastAuthStatus: 'success',
            genNonce: nonce 
          }
        })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw new Error('Failed to update user record');
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
  await supabase.auth.signOut();
};

export default web3Onboard;