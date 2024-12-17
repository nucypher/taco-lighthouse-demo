import { TurboFactory, TurboUploader } from '@ardrive/turbo-sdk';

// Initialize Turbo SDK with the correct configuration
const turbo = TurboFactory.authenticated({
  privateKey: 'your-private-key', // This should be obtained from the user's wallet
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
    // Convert file to Uint8Array
    const fileData = new Uint8Array(await file.arrayBuffer());

    // Create uploader instance
    const uploader = new TurboUploader({
      tags: [
        { name: 'Content-Type', value: file.type },
        { name: 'App-Name', value: 'D-Sound' },
        { name: 'Title', value: title },
        { name: 'Artist', value: artist },
        { name: 'Type', value: 'audio' },
      ],
    });

    // Upload to Arweave using Turbo
    const uploadResponse = await uploader.uploadData(fileData);

    // Store metadata
    const metadata = {
      title,
      artist,
      contentType: file.type,
      timestamp: Date.now(),
    };

    return {
      id: uploadResponse.dataTxId,
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