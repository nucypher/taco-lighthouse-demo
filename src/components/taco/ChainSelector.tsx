import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { SUPPORTED_CHAINS } from '@/types/taco';

interface ChainSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export const ChainSelector = ({ value, onChange }: ChainSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Chain</Label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onChange(parseInt(val, 10))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_CHAINS).map(([chainId, label]) => (
            <SelectItem key={chainId} value={chainId}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};