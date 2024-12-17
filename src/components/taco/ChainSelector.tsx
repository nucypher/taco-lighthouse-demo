import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { SUPPORTED_CHAINS } from '@/types/taco';

interface ChainSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ChainSelector = ({ value, onChange }: ChainSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Chain</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_CHAINS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};