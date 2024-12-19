import { SiweMessage } from 'siwe';
import { supabase } from '@/integrations/supabase/client';
import { getWeb3Provider } from './wallet';
import type { SignInResult, SiweAuthResponse } from '@/types/auth';

export async function createSiweMessage(address: string, statement: string) {
  const { data, error } = await supabase.functions.invoke('nonce');
  
  if (error) {
    console.error('Error fetching nonce:', error);
    throw error;
  }
  
  // Ensure the address is in checksum format
  const web3Provider = getWeb3Provider();
  const checksumAddress = web3Provider.utils.getAddress(address);
  
  const message = new SiweMessage({
    domain: window.location.host,
    address: checksumAddress,
    statement,
    uri: window.location.origin,
    version: '1',
    chainId: 1,
    nonce: data
  });
  return message.prepareMessage();
}

export async function signInWithEthereum(address: string): Promise<SignInResult> {
  // Convert to checksum address before creating message
  const web3Provider = getWeb3Provider();
  const checksumAddress = web3Provider.utils.getAddress(address);
  
  const message = await createSiweMessage(
    checksumAddress,
    'Sign in with Ethereum to TACo'
  );

  const signer = web3Provider.getSigner();
  const signature = await signer.signMessage(message);

  return { message, signature };
}

export async function authenticateWithSupabase(
  address: string, 
  message: string, 
  signature: string
): Promise<SiweAuthResponse> {
  // Convert to checksum address before authentication
  const web3Provider = getWeb3Provider();
  const checksumAddress = web3Provider.utils.getAddress(address);
  
  const { data, error } = await supabase.functions.invoke('siwe-auth', {
    body: { address: checksumAddress, message, signature }
  });

  if (error) {
    console.error('Authentication error:', error);
    throw error;
  }

  return data;
}

export async function setSupabaseSession(session: SiweAuthResponse['session']) {
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}