export interface ReturnValueTest {
  comparator: '>=' | '<=' | '>' | '<' | '=' | '!=';
  value: string;
}

export interface TacoCondition {
  chain: string;
  contractAddress: string;
  standardContractType: 'ERC20' | 'ERC721' | 'ERC1155' | null;
  method: string;
  parameters: string[];
  returnValueTest: ReturnValueTest;
}

export type ConditionType = 'token' | 'contract' | 'time' | 'blockchain';

export const SUPPORTED_CHAINS = {
  sepolia: 'Sepolia Testnet',
  amoy: 'Amoy (Optimism Testnet)'
} as const;