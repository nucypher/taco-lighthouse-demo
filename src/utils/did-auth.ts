import { DID } from 'dids';

export async function createDIDFromWallet(
  provider: any,
  address: string
): Promise<DID | null> {
  try {
    console.log('Creating DID from Privy wallet:', { address });
    
    // The DID is already created and authenticated by Privy
    // We just need to create a DID instance with the provider
    const did = new DID({ provider });
    
    console.log('DID created:', {
      id: did.id,
      authenticated: did.authenticated
    });
    
    return did;
  } catch (error) {
    console.error('Error creating DID:', error);
    return null;
  }
}