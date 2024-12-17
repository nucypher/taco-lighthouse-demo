import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Condition } from '@nucypher/taco';

interface TacoConditionsFormProps {
  onChange: (conditions: Condition[]) => void;
}

export const TacoConditionsForm = ({ onChange }: TacoConditionsFormProps) => {
  const [contractAddress, setContractAddress] = useState('');
  const [minBalance, setMinBalance] = useState('');
  const [chain, setChain] = useState('ethereum');

  const handleChange = () => {
    if (!contractAddress || !minBalance) return;

    const condition: Condition = {
      chain,
      contractAddress,
      standardContractType: 'ERC20',
      method: 'balanceOf',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '>=',
        value: minBalance
      }
    };

    onChange([condition]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Chain</Label>
        <Select value={chain} onValueChange={(value) => {
          setChain(value);
          handleChange();
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="polygon">Polygon</SelectItem>
            <SelectItem value="optimism">Optimism</SelectItem>
            <SelectItem value="arbitrum">Arbitrum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Token Contract Address</Label>
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
        <Label>Minimum Token Balance</Label>
        <Input
          type="number"
          placeholder="Enter minimum balance"
          value={minBalance}
          onChange={(e) => {
            setMinBalance(e.target.value);
            handleChange();
          }}
        />
      </div>
    </div>
  );
};