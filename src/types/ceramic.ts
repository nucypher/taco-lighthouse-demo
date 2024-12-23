import type { RuntimeCompositeDefinition } from '@composedb/types'

// Basic Profile Types
export interface BasicProfile {
  id: string
  displayName?: string
  avatar?: string
}

// Artwork Types
export interface Artwork {
  id: string
  ipfsCid: string
  mimeType: string
  owner: {
    id: string
  }
}

// Track Types
export interface Track {
  id: string
  title: string
  ipfsCid: string
  owner: {
    id: string
  }
  artwork?: Artwork
}

// ComposeDB Query Response Types
export interface ComposeDBResponse<T> {
  data: T
  errors?: Array<{
    message: string
    path?: string[]
  }>
}

// Track Query Response Types
export interface TrackEdge {
  node: Track
}

export interface TrackConnection {
  edges: TrackEdge[]
}

export interface TrackQueryResponse {
  trackIndex: TrackConnection
}

// Track Mutation Types
export interface CreateTrackInput {
  content: {
    title: string
    ipfsCid: string
    artwork?: string // StreamID reference
  }
}

export interface CreateTrackResponse {
  createTrack: {
    document: Track
  }
}

export interface CreateArtworkInput {
  content: {
    ipfsCid: string
    mimeType: string
  }
}

export interface CreateArtworkResponse {
  createArtwork: {
    document: Artwork
  }
}

// Query Helper Types
export type QueryVariables = Record<string, unknown>

export interface QueryOptions<T = unknown> {
  queryKey: string[]
  queryFn: () => Promise<T>
}

// Error Types
export interface CeramicError extends Error {
  code?: string
  details?: unknown
}