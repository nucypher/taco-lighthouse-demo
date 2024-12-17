import { conditions, encrypt, domains } from '@nucypher/taco';
import { ethers } from 'ethers';

export async function encryptAudioFile(
  audioBuffer: ArrayBuffer,
  condition: conditions.condition.Condition,
  _web3Provider: ethers.providers.Web3Provider // Keep this param for now to avoid breaking changes
) {
  console.log('🔒 Starting encryption with TACo...');
  
  // Use Amoy testnet provider
  const amoyProvider = new ethers.providers.JsonRpcProvider(
    'wss://polygon-amoy-bor-rpc.publicnode.com',
    {
      name: 'amoy',
      chainId: 80002, // Mumbai testnet chainId
    }
  );

  console.log('Encryption parameters:', {
    domain: domains.DEVNET,
    conditionType: condition.constructor.name,
    ritualsToTry: 27,
    network: await mumbaiProvider.getNetwork()
  });
  
  const encryptedData = await encrypt(
    mumbaiProvider,
    domains.DEVNET,
    new Uint8Array(audioBuffer),
    condition,
    27
  );
  
  // Convert ThresholdMessageKit to binary format
  const serializedData = encryptedData.toBytes();
  console.log('✅ Encryption successful, encrypted size:', serializedData.byteLength, 'bytes');
  return serializedData;
}