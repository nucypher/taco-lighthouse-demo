import type { RuntimeCompositeDefinition } from '@composedb/types'

// This is a simplified definition while we work on authentication
export const definition: RuntimeCompositeDefinition = {
  models: {
    BasicProfile: {
      id: "kjzl6hvfrbw6c91qmsyejvv1i92r4az4209pajvruzpjcr2e9db2udabksc3o8d",
      accountRelation: { type: "single" },
      interface: false,
      implements: []
    },
    Artwork: {
      id: "kjzl6hvfrbw6c8eg739oh5njr7bpqi1s1f8f11duw796d8jizg5kkw51udpn6r6",
      accountRelation: { type: "list" },
      interface: false,
      implements: []
    },
    Track: {
      id: "kjzl6hvfrbw6cb3qhp48qiszoeh8p9w57ikw5t92bfrclb9ua05vy8itm6jgpm5",
      accountRelation: { type: "list" },
      interface: false,
      implements: []
    }
  },
  objects: {
    BasicProfile: {
      displayName: { type: "string", required: false },
      avatar: { type: "string", required: false }
    },
    Artwork: {
      ipfsCid: { type: "string", required: true },
      mimeType: { type: "string", required: true }
    },
    Track: {
      title: { type: "string", required: true },
      ipfsCid: { type: "string", required: true },
      artwork: { type: "streamid", required: false }
    }
  },
  enums: {},
  accountData: {
    basicProfile: { type: "node", name: "BasicProfile" },
    artworkList: { type: "connection", name: "Artwork" },
    trackList: { type: "connection", name: "Track" }
  }
}