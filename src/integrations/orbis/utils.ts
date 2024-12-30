import { orbisdb } from "./client";
import type { Track, TrackModel } from "./types";

const TRACKS_MODEL_ID = "your-tracks-model-id"; // Replace with your actual model ID

export async function getAllTracks(): Promise<Track[]> {
  console.log("🎵 Fetching all tracks from OrbisDB...");
  try {
    const tracks = await orbisdb.query(TRACKS_MODEL_ID).run();
    console.log("✅ Tracks fetched successfully:", tracks);
    return tracks || [];
  } catch (error) {
    console.error("❌ Error fetching tracks:", error);
    throw error;
  }
}

export async function createTrack(track: TrackModel): Promise<Track> {
  console.log("🎵 Creating new track in OrbisDB:", track);
  try {
    const result = await orbisdb
      .insert(TRACKS_MODEL_ID)
      .value(track)
      .run();
    
    console.log("✅ Track created successfully:", result);
    return result as Track;
  } catch (error) {
    console.error("❌ Error creating track:", error);
    throw error;
  }
}