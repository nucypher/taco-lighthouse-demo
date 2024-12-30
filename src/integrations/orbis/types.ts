export interface Track {
  id: string;
  title: string;
  owner_id: string;
  ipfs_cid: string;
  cover_art_cid?: string;
  created_at: string;
  updated_at: string;
}

export interface TrackModel {
  id: string;
  title: string;
  owner_id: string;
  ipfs_cid: string;
  cover_art_cid?: string;
}