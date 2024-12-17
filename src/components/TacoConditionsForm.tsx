import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { conditions } from '@nucypher/taco';
import { ConditionType } from '@/types/taco';

interface TacoConditionsFormProps {
  onChange: (conditions: any[]) => void;
}

export const TacoConditionsForm = ({ onChange }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('erc20');
  const [contractAddress, setContractAddress] = useState('');
  const [minBalance, setMinBalance] = useState('');
  const [chain, setChain] = useState('sepolia');

  const handleChange = () => {
    if (!contractAddress || !minBalance) return;

    let condition;
    const chainId = chain === 'sepolia' ? 11155111 : 80002;

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

    onChange([condition]);
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