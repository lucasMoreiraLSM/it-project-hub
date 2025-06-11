
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PercentageFieldsProps {
  percentualPrevisto: number;
  percentualRealizado: number;
  onPrevistoChange: (value: number) => void;
  onRealizadoChange: (value: number) => void;
}

export const PercentageFields: React.FC<PercentageFieldsProps> = ({
  percentualPrevisto,
  percentualRealizado,
  onPrevistoChange,
  onRealizadoChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="percentual_previsto">Percentual Previsto (%)</Label>
        <Input
          id="percentual_previsto"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={percentualPrevisto}
          onChange={(e) => onPrevistoChange(parseFloat(e.target.value) || 0)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Calculado automaticamente com base na data de atualização, mas editável
        </p>
      </div>
      <div>
        <Label htmlFor="percentual_realizado">Percentual Realizado (%)</Label>
        <Input
          id="percentual_realizado"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={percentualRealizado}
          onChange={(e) => onRealizadoChange(parseFloat(e.target.value) || 0)}
          required
        />
      </div>
    </div>
  );
};
