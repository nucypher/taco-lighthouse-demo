import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'
import definition from '../composites/__generated__/track-composite.json'
import type { ComposeDBDefinition } from '@/types/ceramic'

// For development, we'll use the Clay testnet
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com'

export const ceramic = new CeramicClient(CERAMIC_URL)

export const composeClient = new ComposeClient({
  ceramic: CERAMIC_URL,
  // Use the imported runtime composite definition with proper typing
  definition: definition as ComposeDBDefinition
})

// Initialize DID authentication
export async function authenticateCeramic(seed?: string) {
  // If no seed is provided, generate a random one
  const seedArray = seed 
    ? fromString(seed.replace(/^0x/, ''), 'base16')
    : crypto.getRandomValues(new Uint8Array(32));
  
  // Create and authenticate the DID
  const provider = new Ed25519Provider(seedArray)
  const did = new DID({
    provider,
    resolver: getResolver(),
  })
  await did.authenticate()
  
  // Set the DID instance on both clients
  ceramic.did = did
  composeClient.setDID(did)
  
  return did
}

// Helper function to convert hex string to Uint8Array
export function hexToU8a(hex: string): Uint8Array {
  return fromString(hex.replace(/^0x/, ''), 'base16')
}