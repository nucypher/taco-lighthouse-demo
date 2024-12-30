import { BaseOrbisClient } from "./base-client";
import { Track } from "@/types/ceramic";
import { ORBIS_CONFIG } from "./config";

export class TracksClient extends BaseOrbisClient {
  async getAllTracks(): Promise<Track[]> {
    console.log("🎵 Fetching all tracks...");
    try {
      const { rows } = await this.query(ORBIS_CONFIG.MODELS.TRACKS).run();
      return rows as Track[] || [];
    } catch (error) {
      console.error("❌ Error fetching tracks:", error);
      throw error;
    }
  }

  async createTrack(data: Omit<Track, 'id' | 'created_at' | 'updated_at'>): Promise<Track> {
    console.log("🎵 Creating new track...");
    try {
      return await this.insert(ORBIS_CONFIG.MODELS.TRACKS, data) as unknown as Track;
    } catch (error) {
      console.error("❌ Error creating track:", error);
      throw error;
    }
  }
}

export const tracksClient = new TracksClient();