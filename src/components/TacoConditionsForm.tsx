import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChainSelector } from './taco/ChainSelector';
import { ConditionTypeSelector } from './taco/ConditionTypeSelector';
import { TacoCondition, ConditionType } from '@/types/taco';

interface TacoConditionsFormProps {
  onChange: (conditions: TacoCondition[]) => void;
}

export const TacoConditionsForm = ({ onChange }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('token');
  const [contractAddress, setContractAddress] = useState('');
  const [value, setValue] = useState('');
  const [chain, setChain] = useState('sepolia');
  const [method, setMethod] = useState('balanceOf');
  const [standardContractType, setStandardContractType] = useState<'ERC20' | 'ERC721' | 'ERC1155'>('ERC20');
  const [comparator, setComparator] = useState<'>=' | '<=' | '>' | '<' | '=' | '!='>('>=');

  const handleChange = () => {
    if (!value) return;

    let condition: TacoCondition;

    switch (conditionType) {
      case 'token':
        if (!contractAddress) return;
        condition = {
          chain,
          contractAddress,
          standardContractType,
          method: 'balanceOf',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator,
            value
          }
        };
        break;

      case 'contract':
        if (!contractAddress || !method) return;
        condition = {
          chain,
          contractAddress,
          standardContractType: null,
          method,
          parameters: [':userAddress'],
          returnValueTest: {
            comparator,
            value
          }
        };
        break;

      case 'time':
        condition = {
          chain,
          contractAddress: '0x0000000000000000000000000000000000000000',
          standardContractType: null,
          method: 'blockTimestamp',
          parameters: [],
          returnValueTest: {
            comparator,
            value: Math.floor(new Date(value).getTime() / 1000).toString()
          }
        };
        break;

      case 'blockchain':
        condition = {
          chain,
          contractAddress: '0x0000000000000000000000000000000000000000',
          standardContractType: null,
          method: 'blockNumber',
          parameters: [],
          returnValueTest: {
            comparator,
            value
          }
        };
        break;

      default:
        return;
    }

    onChange([condition]);
  };

  return (
    <div className="space-y-4">
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

      {(conditionType === 'token' || conditionType === 'contract') && (
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
      )}

      {conditionType === 'token' && (
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
      )}

      {conditionType === 'contract' && (
        <div className="space-y-2">
          <Label>Contract Method</Label>
          <Input
            placeholder="Enter method name"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              handleChange();
            }}
          />
        </div>
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
            conditionType === 'blockchain' ? 'Enter block number' :
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
  );
};