import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { getWeb3Provider } from '@/services/wallet';
import { logWalletEvent } from './wallet-utils';

export async function createAndSignSiweMessage(walletAddress: string, nonce: string) {
  const web3Provider = getWeb3Provider();
  const signer = web3Provider.getSigner();
  
  const message = new SiweMessage({
    domain: window.location.host,
    address: ethers.utils.getAddress(walletAddress),
    statement: 'Sign in with TACo',
    uri: window.location.origin,
    version: '1',
    chainId: 1,
    nonce: nonce
  });

  const messageToSign = message.prepareMessage();
  logWalletEvent('Prepared SIWE message:', messageToSign);
  
  const signature = await signer.signMessage(messageToSign);
  logWalletEvent('Got signature:', signature);

  return { messageToSign, signature };
}

export async function handleSiweAuthentication(walletAddress: string) {
  logWalletEvent('Requesting nonce from edge function...');
  const { data: nonce, error: nonceError } = await supabase.functions.invoke('nonce');
  
  if (nonceError || !nonce) {
    throw new Error('Failed to get nonce for authentication');
  }
  
  logWalletEvent('Received nonce from edge function:', nonce);

  const { messageToSign, signature } = await createAndSignSiweMessage(walletAddress, nonce);

  logWalletEvent('Calling SIWE auth edge function...');
  const redirectUrl = 'http://localhost:8080';
  
  const { data: authData, error: authError } = await supabase.functions.invoke('siwe-auth', {
    body: { 
      address: ethers.utils.getAddress(walletAddress),
      message: messageToSign,
      signature,
      redirect_url: redirectUrl
    }
  });

  if (authError) {
    throw new Error(`SIWE authentication failed: ${authError.message || 'Unknown error'}`);
  }

  logWalletEvent('SIWE auth successful, received data:', authData);

  if (authData?.session?.action_link) {
    logWalletEvent('Redirecting to action link for authentication...');
    window.location.href = authData.session.action_link;
    return true;
  }

  throw new Error('Authentication failed: No action link received');
}