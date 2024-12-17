import { conditions, encrypt, domains } from '@nucypher/taco';
import { ethers } from 'ethers';

export async function encryptAudioFile(
  audioBuffer: ArrayBuffer,
  condition: conditions.condition.Condition,
  web3Provider: ethers.providers.Web3Provider
) {
  console.log('🔒 Starting encryption with TACo...');
  console.log('Encryption parameters:', {
    domain: domains.DEVNET,
    conditionType: condition.constructor.name,
    ritualsToTry: 27
  });
  
  const signer = web3Provider.getSigner();
  const encryptedData = await encrypt(
    web3Provider,
    domains.DEVNET,
    new Uint8Array(audioBuffer),
    condition,
    27,
    signer
  );
  
  console.log('✅ Encryption successful, encrypted size:', encryptedData.byteLength, 'bytes');
  return encryptedData;
}