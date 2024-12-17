import { conditions } from '@nucypher/taco';

export type ConditionType = 'token' | 'time';

export const SUPPORTED_CHAINS = {
  sepolia: 'Sepolia Testnet',
  polygon_amoy: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions we need
export const { ERC721Ownership, ERC20Ownership } = conditions.predefined.erc721;
export const { TimeCondition } = conditions.predefined.time;