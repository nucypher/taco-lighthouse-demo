import type { RuntimeCompositeDefinition } from '@composedb/types'

// Import the generated composite definition
export const definition: RuntimeCompositeDefinition = {
  models: {
    BasicProfile: {
      id: "kjzl6hvfrbw6c91qmsyejvv1i92r4az4209pajvruzpjcr2e9db2udabksc3o8d",
      accountRelation: { type: "single" },
      interface: false,
      implements: [],
      interface: {
        type: "object",
        properties: {
          displayName: { type: "string", maxLength: 100 },
          avatar: { type: "string", maxLength: 1000 }
        }
      }
    },
    Artwork: {
      id: "kjzl6hvfrbw6c8eg739oh5njr7bpqi1s1f8f11duw796d8jizg5kkw51udpn6r6",
      accountRelation: { type: "list" },
      interface: false,
      implements: [],
      interface: {
        type: "object",
        required: ["ipfsCid", "mimeType"],
        properties: {
          ipfsCid: { type: "string", maxLength: 1000 },
          mimeType: { type: "string", maxLength: 50 }
        }
      }
    },
    Track: {
      id: "kjzl6hvfrbw6cb3qhp48qiszoeh8p9w57ikw5t92bfrclb9ua05vy8itm6jgpm5",
      accountRelation: { type: "list" },
      interface: false,
      implements: [],
      interface: {
        type: "object",
        required: ["title", "ipfsCid"],
        properties: {
          title: { type: "string", maxLength: 100 },
          ipfsCid: { type: "string", maxLength: 1000 },
          artwork: { type: "streamid", refType: "document", refModel: "Artwork" }
        }
      }
    }
  },
  objects: {
    BasicProfile: {
      displayName: { type: "string", maxLength: 100 },
      avatar: { type: "string", maxLength: 1000 }
    },
    Artwork: {
      ipfsCid: { type: "string", maxLength: 1000 },
      mimeType: { type: "string", maxLength: 50 }
    },
    Track: {
      title: { type: "string", maxLength: 100 },
      ipfsCid: { type: "string", maxLength: 1000 },
      artwork: { type: "streamid", refType: "document", refModel: "Artwork" }
    }
  },
  enums: {},
  accountData: {
    basicProfile: { type: "node", name: "BasicProfile" },
    artworkList: { type: "connection", name: "Artwork" },
    trackList: { type: "connection", name: "Track" }
  }
}