import { conditions } from '@nucypher/taco';

export type ConditionType = 'token' | 'time';

export const SUPPORTED_CHAINS = {
  sepolia: 'Sepolia Testnet',
  polygon_amoy: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions we need
export const ERC721Ownership = conditions.predefined.erc721.ERC721Ownership;
export const ERC20Balance = conditions.predefined.erc20.ERC20Balance;
export const TimeCondition = conditions.base.Conditions; // Using base Conditions for time checks