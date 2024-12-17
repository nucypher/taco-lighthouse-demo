import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { ConditionType } from '@/types/taco';

interface ConditionTypeSelectorProps {
  value: ConditionType;
  onChange: (value: ConditionType) => void;
}

export const ConditionTypeSelector = ({ value, onChange }: ConditionTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Token Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select token type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="erc20">ERC20 Balance</SelectItem>
          <SelectItem value="erc721">ERC721 Token</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};