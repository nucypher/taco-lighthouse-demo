import { orbisdb } from "./client";
import { Track } from "@/types/ceramic";

const TRACKS_MODEL_ID = "kjzl6hvfrbw6c8w4h3sv4rtf5fhf7bmwxn0carjm1h4kqbk4hrapg65qlc2l2m7";

export async function getAllTracks(): Promise<Track[]> {
  console.log("🎵 Fetching all tracks from OrbisDB...");
  try {
    const { rows: tracks } = await orbisdb
      .select()
      .from(TRACKS_MODEL_ID)
      .run();
    
    console.log("✅ Tracks fetched successfully:", tracks);
    return tracks as Track[] || [];
  } catch (error) {
    console.error("❌ Error fetching tracks:", error);
    throw error;
  }
}

export async function createTrack(data: Omit<Track, 'id' | 'created_at' | 'updated_at'>): Promise<Track> {
  console.log("🎵 Creating new track in OrbisDB...");
  try {
    const result = await orbisdb
      .insert(TRACKS_MODEL_ID)
      .value(data)
      .run();
    
    console.log("✅ Track created successfully:", result);
    return result as unknown as Track;
  } catch (error) {
    console.error("❌ Error creating track:", error);
    throw error;
  }
}