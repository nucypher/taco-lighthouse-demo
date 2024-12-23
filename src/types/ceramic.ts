// Basic types for the mock data
export interface BasicProfile {
  id: string;
  displayName?: string;
  avatar?: string;
}

export interface Artwork {
  id: string;
  ipfsCid: string;
  mimeType: string;
  owner: {
    id: string;
  };
}

export interface Track {
  id: string;
  title: string;
  ipfsCid: string;
  owner: string;
  artwork?: string;
}

// Simplified response types
export type QueryVariables = Record<string, unknown>;