import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { conditions } from '@nucypher/taco';
import { ConditionType, createERC20Balance, createERC721Balance } from '@/types/taco';

const DEFAULT_CONTRACT_ADDRESS = '0x46abDF5aD1726ba700794539C3dB8fE591854729';
const DEFAULT_MIN_BALANCE = '1';
const DEFAULT_CHAIN_ID = '11155111'; // Sepolia as string

interface TacoConditionsFormProps {
  onChange: (condition: conditions.condition.Condition | null) => void;
  disabled?: boolean;
}

export const TacoConditionsForm = ({ onChange, disabled }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('erc20');
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [minBalance, setMinBalance] = useState(DEFAULT_MIN_BALANCE);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const createCondition = () => {
    if (!isInitialized || !contractAddress || !minBalance) {
      onChange(null);
      return;
    }

    const chainIdNumber = parseInt(chainId, 10);
    const minBalanceNumber = parseFloat(minBalance);

    if (isNaN(chainIdNumber) || isNaN(minBalanceNumber)) {
      console.error('Invalid chain ID or minimum balance value');
      onChange(null);
      return;
    }

    try {
      const params = {
        contractAddress,
        chain: chainIdNumber,
        returnValueTest: {
          comparator: ">=" as const,
          value: minBalanceNumber
        }
      };

      const condition = conditionType === 'erc20' 
        ? createERC20Balance(params)
        : createERC721Balance(params);

      console.log('Created condition:', condition);
      onChange(condition);
    } catch (error) {
      console.error('Error creating condition:', error);
      onChange(null);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      createCondition();
    }
  }, [contractAddress, minBalance, chainId, conditionType, isInitialized]);

  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-4 pr-4">
        <ConditionTypeSelector 
          value={conditionType} 
          onChange={(value) => {
            setConditionType(value as ConditionType);
          }} 
        />

        <ChainSelector 
          value={chainId} 
          onChange={(value) => {
            setChainId(value);
          }} 
        />

        <div className="space-y-2">
          <Label>Contract Address</Label>
          <Input
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value);
            }}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Balance</Label>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="Enter minimum balance"
            value={minBalance}
            onChange={(e) => {
              setMinBalance(e.target.value);
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </ScrollArea>
  );
};