import { BaseOrbisClient } from "./base-client";
import { Track } from "@/types/ceramic";
import { ORBIS_CONFIG } from "./config";

export class TracksClient extends BaseOrbisClient {
  async getAllTracks(): Promise<Track[]> {
    console.log("🎵 Fetching all tracks...");
    try {
      const { rows } = await this.query(ORBIS_CONFIG.MODELS.TRACKS).run();
      return rows.map(track => ({
        ...track,
        ipfsCID: track.ipfsCID || track.ipfsCID, // Handle both formats for backward compatibility
        artworkCID: track.artworkCID || track.artworkCID // Handle both formats for backward compatibility
      })) as Track[];
    } catch (error) {
      console.error("❌ Error fetching tracks:", error);
      throw error;
    }
  }

  async createTrack(data: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>): Promise<Track> {
    console.log("🎵 Creating new track...");
    try {
      return await this.insert(ORBIS_CONFIG.MODELS.TRACKS, {
        title: data.title,
        ipfsCID: data.ipfsCID,
        artworkCID: data.artworkCID,
      }) as unknown as Track;
    } catch (error) {
      console.error("❌ Error creating track:", error);
      throw error;
    }
  }
}

export const tracksClient = new TracksClient();