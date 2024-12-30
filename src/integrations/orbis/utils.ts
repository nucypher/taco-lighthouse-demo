import { orbisdb } from "./client";
import type { Track, TrackModel } from "./types";

export async function getAllTracks(): Promise<Track[]> {
  console.log("🎵 Fetching all tracks from OrbisDB...");
  try {
    const tracks = await orbisdb.model("track").query();
    console.log("✅ Tracks fetched successfully:", tracks);
    return tracks;
  } catch (error) {
    console.error("❌ Error fetching tracks:", error);
    throw error;
  }
}

export async function createTrack(track: TrackModel): Promise<Track> {
  console.log("🎵 Creating new track in OrbisDB:", track);
  try {
    const newTrack = await orbisdb.model("track").create(track);
    console.log("✅ Track created successfully:", newTrack);
    return newTrack;
  } catch (error) {
    console.error("❌ Error creating track:", error);
    throw error;
  }
}