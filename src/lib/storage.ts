import { createData, InjectedEthereumSigner } from 'arbundles';
import { TurboAuthenticatedClient } from '@ardrive/turbo-sdk/web';

// Initialize Turbo SDK with the correct configuration
const turbo = new TurboAuthenticatedClient({
  auth: {
    provider: 'arconnect'
  },
  gateway: 'https://turbo.ardrive.io',
  network: 'mainnet'
});

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

export const uploadTrack = async ({ file, title, artist, accessConditions }: UploadTrackOptions) => {
  try {
    // Convert file to ArrayBuffer for arbundles
    const fileData = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileData);
    
    // Create signer (this needs to be implemented based on your wallet integration)
    const signer = {} as InjectedEthereumSigner; // Placeholder - implement actual signer
    
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
    
    // Upload to Arweave using Turbo
    const uploadResponse = await turbo.uploadSignedDataItem({
      dataItemStreamFactory: () => dataItem.getRaw(),
      dataItemSizeFactory: () => dataItem.getRaw().byteLength,
    });

    // Store metadata
    const metadata = {
      title,
      artist,
      contentType: file.type,
      timestamp: Date.now(),
    };

    return {
      id: uploadResponse.id,
      metadata,
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