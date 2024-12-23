import { DID } from 'dids';
import { PKHEthereumAuthProvider } from '@didtools/pkh-ethereum';

export async function createDIDFromWallet(
  provider: any,
  address: string
): Promise<DID | null> {
  try {
    console.log('Creating DID from wallet:', { address });
    
    // Create an Ethereum auth provider using the wallet's provider and address
    const authProvider = new PKHEthereumAuthProvider(provider, address);
    
    // Create and authenticate the DID
    const did = new DID({ provider: authProvider });
    await did.authenticate();
    
    console.log('DID created and authenticated:', {
      id: did.id,
      authenticated: did.authenticated
    });
    
    return did;
  } catch (error) {
    console.error('Error creating DID:', error);
    return null;
  }
}