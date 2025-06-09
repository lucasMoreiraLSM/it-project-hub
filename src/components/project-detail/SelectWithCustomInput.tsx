
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SelectWithCustomInputProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  id?: string;
}

export const SelectWithCustomInput: React.FC<SelectWithCustomInputProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  id
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setIsCustomMode(true);
      setCustomValue(value);
    } else {
      onValueChange(selectedValue);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onValueChange(customValue.trim());
      setIsCustomMode(false);
      setCustomValue('');
    }
  };

  const handleCustomCancel = () => {
    setIsCustomMode(false);
    setCustomValue('');
  };

  if (isCustomMode) {
    return (
      <div className="flex gap-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Digite um novo valor..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCustomSubmit();
            } else if (e.key === 'Escape') {
              handleCustomCancel();
            }
          }}
          autoFocus
        />
        <Button onClick={handleCustomSubmit} size="sm" disabled={!customValue.trim()}>
          Confirmar
        </Button>
        <Button onClick={handleCustomCancel} variant="outline" size="sm">
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange} disabled={disabled}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        <SelectItem value="custom" className="font-medium text-blue-600">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar novo...
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
