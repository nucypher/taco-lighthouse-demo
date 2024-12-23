import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'
import { definition } from './definition'

// For development, we'll use the Clay testnet
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com'

export const ceramic = new CeramicClient(CERAMIC_URL)

export const composeClient = new ComposeClient({
  ceramic: CERAMIC_URL,
  // Use the imported runtime composite definition with proper typing
  definition
})

// Initialize DID authentication
export async function authenticateCeramic(did: DID) {
  console.log('Authenticating Ceramic with DID:', did.id);
  
  // Set the DID instance on both clients
  ceramic.did = did;
  composeClient.setDID(did);
  
  console.log('Ceramic authentication complete');
  return did;
}