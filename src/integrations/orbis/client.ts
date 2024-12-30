import { OrbisDB } from "@useorbis/db-sdk";
import { OrbisEVMAuth } from "@useorbis/db-sdk/auth";
import { ProfileModel, TrackModel, CERAMIC_NODE_URL, ORBIS_NODE_URL, ENVIRONMENT_ID } from "./models";

export const orbisdb = new OrbisDB({
  ceramic: {
    gateway: CERAMIC_NODE_URL
  },
  nodes: [
    {
      gateway: ORBIS_NODE_URL,
      env: ENVIRONMENT_ID
    }
  ],
  models: {
    profile: ProfileModel,
    track: TrackModel
  }
});

console.log("🌍 OrbisDB client initialized with:", {
  ceramic: CERAMIC_NODE_URL,
  nodes: [{ gateway: ORBIS_NODE_URL, env: ENVIRONMENT_ID }]
});

export async function connectOrbisUser(provider: any) {
  try {
    console.log("🔑 Connecting user to OrbisDB...");
    const auth = new OrbisEVMAuth(provider);
    const authResult = await orbisdb.connectUser({ auth });
    console.log("✅ User connected to OrbisDB:", authResult);
    return authResult;
  } catch (error) {
    console.error("❌ Error connecting user to OrbisDB:", error);
    throw error;
  }
}

export async function isOrbisUserConnected(address?: string) {
  try {
    const connected = await orbisdb.isUserConnected(address);
    console.log("🔍 Checking OrbisDB connection:", { address, connected });
    return connected;
  } catch (error) {
    console.error("❌ Error checking OrbisDB connection:", error);
    return false;
  }
}

export async function getOrbisConnectedUser() {
  try {
    const user = await orbisdb.getConnectedUser();
    console.log("👤 Current OrbisDB user:", user);
    return user;
  } catch (error) {
    console.error("❌ Error getting OrbisDB user:", error);
    return false;
  }
}