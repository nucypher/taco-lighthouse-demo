import { TurboFactory, DataItem } from '@ardrive/turbo-sdk';

// Initialize Turbo SDK
const turbo = TurboFactory.authenticated({ authType: 'local-wallet' });

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
    // Create metadata
    const metadata = {
      title,
      artist,
      contentType: file.type,
      timestamp: Date.now(),
    };

    // Create DataItem with TACo access conditions
    const dataItem = await DataItem.create(
      new Uint8Array(await file.arrayBuffer()),
      {
        tags: [
          { name: 'Content-Type', value: file.type },
          { name: 'App-Name', value: 'D-Sound' },
          { name: 'Title', value: title },
          { name: 'Artist', value: artist },
          { name: 'Type', value: 'audio' },
        ],
        accessConditions,
      }
    );

    // Upload to Arweave using Turbo
    const uploadResponse = await turbo.uploadDataItem(dataItem);

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
    const response = await turbo.getDataItem(id);
    return response;
  } catch (error) {
    console.error('Error fetching track:', error);
    throw error;
  }
};