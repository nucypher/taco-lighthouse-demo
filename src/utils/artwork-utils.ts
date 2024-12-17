export const getArtworkUrl = (cid: string | null) => {
  if (!cid) return "/placeholder.svg";
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
};

export const getTrackUrl = (cid: string | null) => {
  if (!cid) return null;
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
};