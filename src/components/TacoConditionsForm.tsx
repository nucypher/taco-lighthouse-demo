import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [tokenId, setTokenId] = useState('');
  const [minBalance, setMinBalance] = useState('');
  const [chain, setChain] = useState('sepolia');
  const [erc721Mode, setErc721Mode] = useState<'balance' | 'ownership'>('ownership');

  const handleChange = () => {
    if (!contractAddress) return;

    let condition;
    const chainId = chain === 'sepolia' ? 11155111 : 80002;

    if (conditionType === 'erc20') {
      if (!minBalance) return;
      condition = new conditions.predefined.erc20.ERC20Balance({
        contractAddress,
        chain: chainId,
        parameters: [minBalance]
      });
    } else {
      if (erc721Mode === 'ownership') {
        if (!tokenId) return;
        condition = new conditions.predefined.erc721.ERC721Ownership({
          contractAddress,
          chain: chainId,
          parameters: [tokenId]
        });
      } else {
        if (!minBalance) return;
        condition = new conditions.predefined.erc721.ERC721Balance({
          contractAddress,
          chain: chainId,
          parameters: [minBalance]
        });
      }
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

        {conditionType === 'erc721' && (
          <div className="space-y-2">
            <Label>ERC721 Mode</Label>
            <Select value={erc721Mode} onValueChange={(value: 'balance' | 'ownership') => {
              setErc721Mode(value);
              handleChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ownership">Token Ownership</SelectItem>
                <SelectItem value="balance">Token Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(conditionType === 'erc20' || (conditionType === 'erc721' && erc721Mode === 'balance')) && (
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
        )}

        {conditionType === 'erc721' && erc721Mode === 'ownership' && (
          <div className="space-y-2">
            <Label>Token ID</Label>
            <Input
              type="text"
              placeholder="Enter token ID"
              value={tokenId}
              onChange={(e) => {
                setTokenId(e.target.value);
                handleChange();
              }}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};