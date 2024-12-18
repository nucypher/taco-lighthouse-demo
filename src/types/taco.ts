import { conditions } from '@nucypher/taco';

export type ConditionType = 'erc20' | 'erc721';

export const SUPPORTED_CHAINS = {
  11155111: 'Sepolia Testnet',
  80002: 'Polygon Amoy Testnet'
} as const;

// Re-export the conditions with proper type definitions
export const createERC721Balance = (params: {
  contractAddress: string;
  chain: number;
  returnValueTest: {
    comparator: ">=" | "==" | ">" | "<" | "<=" | "!=";
    value: number;
  };
}) => new conditions.predefined.erc721.ERC721Balance(params);

export const createERC721Ownership = (params: {
  contractAddress: string;
  chain: number;
  tokenId: number;
}) => new conditions.predefined.erc721.ERC721Ownership(params);

export const createERC20Balance = (params: {
  contractAddress: string;
  chain: number;
  returnValueTest: {
    comparator: ">=" | "==" | ">" | "<" | "<=" | "!=";
    value: number;
  };
}) => new conditions.predefined.erc20.ERC20Balance(params);