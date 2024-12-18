import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { conditions } from '@nucypher/taco';
import { ConditionType } from '@/types/taco';

const DEFAULT_CONTRACT_ADDRESS = '0x46abDF5aD1726ba700794539C3dB8fE591854729';
const DEFAULT_MIN_BALANCE = '1';
const DEFAULT_CHAIN_ID = 11155111; // Sepolia

interface TacoConditionsFormProps {
  onChange: (condition: conditions.condition.Condition | null) => void;
  disabled?: boolean;
}

export const TacoConditionsForm = ({ onChange, disabled }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('erc20');
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [minBalance, setMinBalance] = useState(DEFAULT_MIN_BALANCE);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);

  const createCondition = () => {
    if (!contractAddress || !minBalance) {
      onChange(null);
      return;
    }

    console.log('Creating condition with chainId:', chainId);

    let condition;
    if (conditionType === 'erc20') {
      condition = new conditions.predefined.erc20.ERC20Balance({
        contractAddress,
        chain: chainId,
        returnValueTest: {
          comparator: '>=',
          value: minBalance
        }
      });
    } else {
      condition = new conditions.predefined.erc721.ERC721Balance({
        contractAddress,
        chain: chainId,
        returnValueTest: {
          comparator: '>=',
          value: minBalance
        }
      });
    }

    console.log('Created condition:', condition);
    onChange(condition);
  };

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
          value={chainId} 
          onChange={(value) => {
            setChainId(value);
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </div>
      </div>
    </ScrollArea>
  );
};