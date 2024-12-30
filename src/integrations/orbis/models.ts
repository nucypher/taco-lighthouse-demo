import { Model } from "@useorbis/db-sdk";

// Basic profile model for users
export const ProfileModel: Model = {
  name: "Profile",
  schema: {
    type: "object",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Profile",
    properties: {
      displayName: {
        type: "string",
        maxLength: 100
      },
      avatar: {
        type: "string",
        maxLength: 1000
      }
    }
  },
  accountRelation: {
    type: "single"
  }
};

// Track model
export const TrackModel: Model = {
  name: "Track",
  schema: {
    type: "object",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Track",
    required: ["title", "ipfsCid"],
    properties: {
      title: {
        type: "string",
        maxLength: 100
      },
      ipfsCid: {
        type: "string",
        maxLength: 1000
      },
      description: {
        type: "string",
        maxLength: 1000
      },
      coverArtCid: {
        type: "string",
        maxLength: 1000
      },
      createdAt: {
        type: "string",
        format: "date-time"
      },
      updatedAt: {
        type: "string",
        format: "date-time"
      }
    }
  },
  accountRelation: {
    type: "list"
  }
};

// Now let's update the OrbisDB client to use these models
export const CERAMIC_NODE_URL = "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/";
export const ORBIS_NODE_URL = "https://studio.useorbis.com";
export const ENVIRONMENT_ID = "did:pkh:eip155:1:0x2215a197a32834ef93c4d1029551bb8d3b924dcc";