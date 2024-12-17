import { conditions } from '@nucypher/taco';

export type ConditionType = 'erc20' | 'erc721';

export const SUPPORTED_CHAINS = {
  sepolia: 'Sepolia Testnet',
  polygon_amoy: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions we need
export const { ERC721Balance, ERC721Ownership, ERC20Balance } = conditions.predefined;