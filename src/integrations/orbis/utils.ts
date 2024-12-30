import { orbisdb } from "./client";
import type { Track, TrackModel } from "./types";

const TRACKS_MODEL_ID = "your-tracks-model-id"; // Replace with your actual model ID

export async function getAllTracks(): Promise<Track[]> {
  console.log("🎵 Fetching all tracks from OrbisDB...");
  try {
    const tracks = await orbisdb.ceramic.getModel(TRACKS_MODEL_ID);
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
    const newTrack = await orbisdb.ceramic.writeDocument(TRACKS_MODEL_ID, {
      content: track
    });
    console.log("✅ Track created successfully:", newTrack);
    return newTrack;
  } catch (error) {
    console.error("❌ Error creating track:", error);
    throw error;
  }
}