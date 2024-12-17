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
      <Label>Condition Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select condition type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="token">Token Balance</SelectItem>
          <SelectItem value="time">Time-based</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};