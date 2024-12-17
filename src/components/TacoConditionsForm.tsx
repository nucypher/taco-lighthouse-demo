import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { conditions } from '@nucypher/taco';
import { ConditionType } from '@/types/taco';

// Use the provided contract address as the default
const DEFAULT_CONTRACT_ADDRESS = '0x46abDF5aD1726ba700794539C3dB8fE591854729';
const DEFAULT_MIN_BALANCE = '1';

interface TacoConditionsFormProps {
  onChange: (condition: conditions.condition.Condition | null) => void;
}

export const TacoConditionsForm = ({ onChange }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('erc20');
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [minBalance, setMinBalance] = useState(DEFAULT_MIN_BALANCE);
  const [chain, setChain] = useState('sepolia');

  const createCondition = () => {
    if (!contractAddress || !minBalance) {
      onChange(null);
      return;
    }

    // Use the correct chain ID for TACo conditions
    const chainId = chain === 'sepolia' ? 11155111 : 80001;

    let condition;
    if (conditionType === 'erc20') {
      condition = conditions.predefined.erc20.ERC20Balance.create({
        contractAddress,
        chain: chainId,
        returnValueTest: {
          comparator: '>=',
          value: minBalance
        }
      });
    } else {
      condition = conditions.predefined.erc721.ERC721Balance.create({
        contractAddress,
        chain: chainId,
        returnValueTest: {
          comparator: '>=',
          value: minBalance
        }
      });
    }

    onChange(condition);
  };

  // Set initial condition on mount
  useEffect(() => {
    createCondition();
  }, []);

  const handleChange = () => {
    createCondition();
  };

  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-4 pr-4">
        <ConditionTypeSelector 
          value={conditionType} 
          onChange={(value) => {
            setConditionType(value as ConditionType);
            handleChange();
          }} 
        />

        <ChainSelector 
          value={chain} 
          onChange={(value) => {
            setChain(value);
            handleChange();
          }} 
        />

        <div className="space-y-2">
          <Label>Contract Address</Label>
          <Input
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value);
              handleChange();
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Balance</Label>
          <Input
            type="text"
            placeholder="Enter minimum balance"
            value={minBalance}
            onChange={(e) => {
              setMinBalance(e.target.value);
              handleChange();
            }}
          />
        </div>
      </div>
    </ScrollArea>
  );
};