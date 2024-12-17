import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { TacoCondition, ConditionType } from '@/types/taco';
import { TokenBalanceCondition, TimeCondition } from '@nucypher/taco';

interface TacoConditionsFormProps {
  onChange: (conditions: TacoCondition[]) => void;
}

export const TacoConditionsForm = ({ onChange }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('token');
  const [contractAddress, setContractAddress] = useState('');
  const [value, setValue] = useState('');
  const [chain, setChain] = useState('sepolia');
  const [standardContractType, setStandardContractType] = useState<'ERC20' | 'ERC721' | 'ERC1155'>('ERC20');
  const [comparator, setComparator] = useState<'>=' | '<=' | '>' | '<' | '=' | '!='>('>=');

  const handleChange = () => {
    if (!value) return;

    let condition: TacoCondition;

    switch (conditionType) {
      case 'token':
        if (!contractAddress) return;
        condition = TokenBalanceCondition.create({
          chain,
          contractAddress,
          standardContractType,
          comparator,
          value,
        });
        break;

      case 'time':
        condition = TimeCondition.create({
          chain,
          comparator,
          timestamp: Math.floor(new Date(value).getTime() / 1000).toString()
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
          <Label>Comparator</Label>
          <Select value={comparator} onValueChange={(value: '>=' | '<=' | '>' | '<' | '=' | '!=') => {
            setComparator(value);
            handleChange();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select comparator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=">=">Greater than or equal (≥)</SelectItem>
              <SelectItem value="<=">Less than or equal (≤)</SelectItem>
              <SelectItem value=">">Greater than (&gt;)</SelectItem>
              <SelectItem value="<">Less than (&lt;)</SelectItem>
              <SelectItem value="=">Equal (=)</SelectItem>
              <SelectItem value="!=">Not equal (≠)</SelectItem>
            </SelectContent>
          </Select>
        </div>

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