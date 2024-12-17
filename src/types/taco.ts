import { conditions } from '@nucypher/taco';

export type ConditionType = 'erc20' | 'erc721';

export const SUPPORTED_CHAINS = {
  sepolia: 'Sepolia Testnet',
  polygon_amoy: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions we need
export const ERC721Balance = conditions.predefined.erc721.ERC721Balance;
export const ERC721Ownership = conditions.predefined.erc721.ERC721Ownership;
export const ERC20Balance = conditions.predefined.erc20.ERC20Balance;