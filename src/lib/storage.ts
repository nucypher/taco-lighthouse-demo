import { createData, InjectedEthereumSigner } from 'arbundles';
import { TurboFactory } from '@ardrive/turbo-sdk/web';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface UploadTrackOptions {
  file: File;
  title: string;
  artist: string;
  accessConditions: {
    contractTxId: string;
    contractSourceTxId: string;
    evaluationOptions: {
      sourceType: string;
      environment: Record<string, unknown>;
    };
  };
}

export const uploadTrack = async ({ file, title, artist }: UploadTrackOptions) => {
  try {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found");
    }
    
    // Initialize provider and get signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const ethSigner = await provider.getSigner();
    
    // Create a provider object that matches what InjectedEthereumSigner expects
    const minimalProvider = {
      getSigner: () => ({
        getAddress: ethSigner.getAddress.bind(ethSigner),
        signMessage: (message: string | Uint8Array) => {
          return ethSigner.signMessage(message);
        }
      })
    };

    const signer = new InjectedEthereumSigner(minimalProvider);
    await signer.setPublicKey();

    // Convert file to string/buffer for upload
    const fileData = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileData);
    
    // Create data item with tags
    const tags = [
      { name: 'Content-Type', value: file.type },
      { name: 'App-Name', value: 'D-Sound' },
      { name: 'Title', value: title },
      { name: 'Artist', value: artist },
      { name: 'Type', value: 'audio' }
    ];
    
    const dataItem = createData(fileBytes, signer, { tags });
    await dataItem.sign(signer);
    
    // Initialize Turbo client
    const turbo = TurboFactory.authenticated({
      signer: signer as any,
    });

    // Upload to Arweave using Turbo
    const response = await turbo.uploadSignedDataItem({
      dataItemStreamFactory: () => dataItem.getRaw(),
      dataItemSizeFactory: () => dataItem.getRaw().byteLength,
    });

    console.log('Upload response:', response);

    return {
      id: response.id,
      metadata: {
        title,
        artist,
        contentType: file.type,
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error('Error uploading track:', error);
    throw error;
  }
};

export const getTrack = async (id: string) => {
  try {
    const response = await fetch(`https://arweave.net/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch track');
    }
    return response;
  } catch (error) {
    console.error('Error fetching track:', error);
    throw error;
  }
};