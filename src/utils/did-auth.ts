import { DID } from 'dids';
import { EthereumAuthProvider } from '@didtools/pkh-ethereum';
import { authenticateCeramic } from '@/integrations/ceramic/client';

export async function createDIDFromWallet(
  provider: any,
  address: string
): Promise<DID | null> {
  try {
    console.log('Creating DID from wallet:', { address });
    
    // Create an Ethereum auth provider using the wallet's provider and address
    const authProvider = new EthereumAuthProvider(provider, address);
    
    // Authenticate with Ceramic using the auth provider
    const did = await authenticateCeramic();
    
    console.log('DID created successfully:', {
      id: did.id,
      authenticated: did.authenticated
    });
    
    return did;
  } catch (error) {
    console.error('Error creating DID:', error);
    return null;
  }
}