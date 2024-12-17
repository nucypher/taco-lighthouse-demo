import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { ConditionType, ERC20Balance, TimeCondition } from '@/types/taco';

interface TacoConditionsFormProps {
  onChange: (conditions: any[]) => void;
}

export const TacoConditionsForm = ({ onChange }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('token');
  const [contractAddress, setContractAddress] = useState('');
  const [value, setValue] = useState('');
  const [chain, setChain] = useState('sepolia');
  const [standardContractType, setStandardContractType] = useState<'ERC20' | 'ERC721' | 'ERC1155'>('ERC20');

  const handleChange = () => {
    if (!value) return;

    let condition;

    switch (conditionType) {
      case 'token':
        if (!contractAddress) return;
        condition = new ERC20Balance({
          contractAddress,
          chain: chain === 'sepolia' ? 11155111 : 80002, // Chain IDs for Sepolia and Polygon Amoy
          standardContractType: 'ERC20',
          method: 'balanceOf',
          returnValueTest: {
            comparator: ">=",
            value: value
          }
        });
        break;

      case 'time':
        const timestamp = Math.floor(new Date(value).getTime() / 1000);
        condition = new TimeCondition({
          conditionType: 'time',
          method: 'getTimestamp',
          returnValueTest: {
            comparator: ">=",
            value: timestamp
          },
          chain: chain === 'sepolia' ? 11155111 : 80002,
        });
        break;

      default:
        return;
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

        {conditionType === 'token' && (
          <>
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
              <Label>Token Standard</Label>
              <Select value={standardContractType} onValueChange={(value: 'ERC20' | 'ERC721' | 'ERC1155') => {
                setStandardContractType(value);
                handleChange();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERC20">ERC20</SelectItem>
                  <SelectItem value="ERC721">ERC721</SelectItem>
                  <SelectItem value="ERC1155">ERC1155</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>{conditionType === 'time' ? 'Date and Time' : 'Value'}</Label>
          <Input
            type={conditionType === 'time' ? 'datetime-local' : 'text'}
            placeholder={
              conditionType === 'token' ? 'Enter minimum balance' :
              conditionType === 'time' ? 'Select date and time' :
              'Enter expected value'
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleChange();
            }}
          />
        </div>
      </div>
    </ScrollArea>
  );
};