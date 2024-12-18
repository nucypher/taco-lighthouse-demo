import { conditions, encrypt, domains } from '@nucypher/taco';
import { ethers } from 'ethers';

export async function encryptAudioFile(
  audioBuffer: ArrayBuffer,
  condition: conditions.condition.Condition,
  web3Provider: ethers.providers.Web3Provider
) {
  console.log('🔒 Starting encryption with TACo...');
  
  // Use Amoy testnet provider for RPC access
  const amoyProvider = new ethers.providers.JsonRpcProvider(
    'https://rpc-amoy.polygon.technology',
    {
      name: 'amoy',
      chainId: 80002, // Amoy testnet chainId
    }
  );

  // Get signer from the connected wallet
  const signer = web3Provider.getSigner();

  console.log('Encryption parameters:', {
    domain: domains.DEVNET,
    conditionType: condition.constructor.name,
    ritualsToTry: 27,
    network: await amoyProvider.getNetwork(),
    signerAddress: await signer.getAddress()
  });
  
  const encryptedData = await encrypt(
    amoyProvider,
    domains.DEVNET,
    new Uint8Array(audioBuffer),
    condition,
    27,
    signer // Pass the wallet's signer as the 6th argument
  );
  
  // Convert ThresholdMessageKit to binary format
  const serializedData = encryptedData.toBytes();
  console.log('✅ Encryption successful, encrypted size:', serializedData.byteLength, 'bytes');
  return serializedData;
}