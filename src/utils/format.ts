export const formatWalletAddress = (address: string | null) => {
  if (!address) return 'Unknown Artist';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getTrackUrl = (cid: string | null) => {
  if (!cid) return null;
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
};

export const getArtworkUrl = (cid: string | null) => {
  if (!cid) return "/placeholder.svg";
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
};