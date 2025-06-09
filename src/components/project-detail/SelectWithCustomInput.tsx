
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useCustomFieldOptions } from '@/hooks/useCustomFieldOptions';

interface SelectWithCustomInputProps {
  value: string;
  onValueChange: (value: string) => void;
  fieldName: string;
  placeholder: string;
  disabled?: boolean;
  id?: string;
}

export const SelectWithCustomInput: React.FC<SelectWithCustomInputProps> = ({
  value,
  onValueChange,
  fieldName,
  placeholder,
  disabled = false,
  id
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const { options, loading, addOption, removeOption } = useCustomFieldOptions(fieldName);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setIsCustomMode(true);
      setCustomValue(value);
    } else {
      onValueChange(selectedValue);
    }
  };

  const handleCustomSubmit = async () => {
    if (customValue.trim()) {
      const newValue = customValue.trim();
      const success = await addOption(newValue);
      
      if (success) {
        onValueChange(newValue);
        setIsCustomMode(false);
        setCustomValue('');
      }
    }
  };

  const handleCustomCancel = () => {
    setIsCustomMode(false);
    setCustomValue('');
  };

  const handleDeleteOption = async (optionToDelete: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const success = await removeOption(optionToDelete);
    
    if (success && value === optionToDelete) {
      onValueChange('');
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

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
          <div key={option} className="relative group">
            <SelectItem value={option} className="pr-8">
              {option}
            </SelectItem>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-red-50 rounded transition-colors z-50 opacity-0 group-hover:opacity-100"
              onClick={(e) => handleDeleteOption(option, e)}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
            >
              <X className="h-3 w-3 text-red-500 hover:text-red-700" />
            </button>
          </div>
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
