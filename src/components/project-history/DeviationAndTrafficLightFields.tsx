
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeviationAndTrafficLightFieldsProps {
  percentualDesvio: number;
  farol: 'Verde' | 'Amarelo' | 'Vermelho';
  onFarolChange: (value: 'Verde' | 'Amarelo' | 'Vermelho') => void;
}

export const DeviationAndTrafficLightFields: React.FC<DeviationAndTrafficLightFieldsProps> = ({
  percentualDesvio,
  farol,
  onFarolChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="percentual_desvio">Desvio (%)</Label>
        <Input
          id="percentual_desvio"
          type="number"
          step="0.1"
          value={percentualDesvio.toFixed(1)}
          disabled
          className="bg-gray-100"
        />
      </div>
      <div>
        <Label htmlFor="farol">Farol</Label>
        <Select 
          value={farol} 
          onValueChange={(value: 'Verde' | 'Amarelo' | 'Vermelho') => onFarolChange(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Verde">🟢 Verde</SelectItem>
            <SelectItem value="Amarelo">🟡 Amarelo</SelectItem>
            <SelectItem value="Vermelho">🔴 Vermelho</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
