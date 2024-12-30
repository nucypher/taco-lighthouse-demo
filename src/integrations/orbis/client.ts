import { OrbisDB } from "@useorbis/db-sdk";

const CERAMIC_NODE_URL = "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/";
const ORBIS_NODE_URL = "https://studio.useorbis.com";
const ENVIRONMENT_ID = "did:pkh:eip155:1:0x2215a197a32834ef93c4d1029551bb8d3b924dcc";

export const orbisdb = new OrbisDB({
  ceramic: {
    gateway: CERAMIC_NODE_URL
  },
  nodes: [
    {
      gateway: ORBIS_NODE_URL,
      env: ENVIRONMENT_ID
    }
  ]
});

console.log("🌍 OrbisDB client initialized with:", {
  ceramic: CERAMIC_NODE_URL,
  nodes: [{ gateway: ORBIS_NODE_URL, env: ENVIRONMENT_ID }]
});