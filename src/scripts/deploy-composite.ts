import { CeramicClient } from '@ceramicnetwork/http-client'
import { createComposite } from '@composedb/devtools'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fromString } from 'uint8arrays'

// Configure ceramic client
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com'
const ceramic = new CeramicClient(CERAMIC_URL)

async function main() {
  // Read and parse the composite definition
  const composite = await createComposite(
    ceramic,
    'src/composites/track.graphql'
  )

  // Write composite definition to JSON file
  await composite.startIndexing()
  const compositeDir = resolve(__dirname, '../composites')
  await composite.writeComposite(resolve(compositeDir, 'track-composite.json'))
  
  console.log('Composite created successfully!')
  console.log('Definition:', composite.toString())
  process.exit(0)
}

main().catch(console.error)