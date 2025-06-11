
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateAndTotalDaysFieldsProps {
  dataAtualizacao: string;
  totalDias: number;
  onDateChange: (date: string) => void;
}

export const DateAndTotalDaysFields: React.FC<DateAndTotalDaysFieldsProps> = ({
  dataAtualizacao,
  totalDias,
  onDateChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="data_atualizacao">Data de Atualização</Label>
        <Input
          id="data_atualizacao"
          type="date"
          value={dataAtualizacao}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="total_dias">Total de Dias</Label>
        <Input
          id="total_dias"
          type="number"
          min="0"
          value={totalDias}
          disabled
          className="bg-gray-100"
        />
      </div>
    </div>
  );
};
