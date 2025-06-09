
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface SelectWithCustomInputProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  onOptionsChange?: (options: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  id?: string;
}

export const SelectWithCustomInput: React.FC<SelectWithCustomInputProps> = ({
  value,
  onValueChange,
  options,
  onOptionsChange,
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
      const newValue = customValue.trim();
      onValueChange(newValue);
      
      // Add to options list if it doesn't exist and onOptionsChange is provided
      if (onOptionsChange && !options.includes(newValue)) {
        onOptionsChange([...options, newValue]);
      }
      
      setIsCustomMode(false);
      setCustomValue('');
    }
  };

  const handleCustomCancel = () => {
    setIsCustomMode(false);
    setCustomValue('');
  };

  const handleDeleteOption = (optionToDelete: string) => {
    if (onOptionsChange) {
      const updatedOptions = options.filter(option => option !== optionToDelete);
      onOptionsChange(updatedOptions);
      
      // If the deleted option was selected, clear the selection
      if (value === optionToDelete) {
        onValueChange('');
      }
    }
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
          <SelectItem key={option} value={option} className="group">
            <div className="flex items-center justify-between w-full">
              <span>{option}</span>
              {onOptionsChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 ml-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteOption(option);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
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
