import { conditions } from '@nucypher/taco';

export type ConditionType = 'erc20' | 'erc721';

// Using direct chain IDs instead of string mappings
export const SUPPORTED_CHAINS = {
  11155111: 'Sepolia Testnet',
  80002: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions with proper type definitions
export const ERC721Balance = conditions.predefined.erc721.ERC721Balance;

export const ERC721Ownership = conditions.predefined.erc721.ERC721Ownership;

export const ERC20Balance = conditions.predefined.erc20.ERC20Balance;