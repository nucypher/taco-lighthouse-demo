import { conditions } from '@nucypher/taco';

export type ConditionType = 'token' | 'time';

export const SUPPORTED_CHAINS = {
  sepolia: 'Sepolia Testnet',
  polygon_amoy: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions we need
export const ERC721Ownership = conditions.predefined.erc721.ERC721Ownership;
export const ERC20Ownership = conditions.predefined.erc20.ERC20Ownership;
export const TimeCondition = conditions.predefined.timestamp.TimestampCondition;