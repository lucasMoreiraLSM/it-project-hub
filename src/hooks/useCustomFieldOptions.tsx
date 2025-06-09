
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomFieldOption {
  id: string;
  field_name: string;
  option_value: string;
}

export const useCustomFieldOptions = (fieldName: string) => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_field_options')
        .select('option_value')
        .eq('field_name', fieldName)
        .order('option_value');

      if (error) throw error;

      setOptions(data.map(item => item.option_value));
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar opções do campo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOption = async (newOption: string) => {
    try {
      const { error } = await supabase
        .from('custom_field_options')
        .insert({
          field_name: fieldName,
          option_value: newOption
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Aviso",
            description: "Esta opção já existe",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      await fetchOptions();
      toast({
        title: "Sucesso",
        description: "Opção adicionada com sucesso",
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar opção:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar opção",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeOption = async (optionToRemove: string) => {
    try {
      // Verificar se a opção está sendo usada em algum projeto
      const isInUse = await checkIfOptionInUse(fieldName, optionToRemove);
      
      if (isInUse) {
        toast({
          title: "Não é possível excluir",
          description: "Esta opção está sendo usada em um ou mais projetos",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('custom_field_options')
        .delete()
        .eq('field_name', fieldName)
        .eq('option_value', optionToRemove);

      if (error) throw error;

      await fetchOptions();
      toast({
        title: "Sucesso",
        description: "Opção removida com sucesso",
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover opção:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover opção",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkIfOptionInUse = async (fieldName: string, optionValue: string): Promise<boolean> => {
    try {
      let columnName = '';
      
      // Mapear nome do campo para nome da coluna na tabela projetos
      switch (fieldName) {
        case 'areaNegocio':
          columnName = 'area_negocio';
          break;
        case 'timeTI':
          columnName = 'time_ti';
          break;
        case 'inovacaoMelhoria':
          columnName = 'inovacao_melhoria';
          break;
        case 'estrategicoTatico':
          columnName = 'estrategico_tatico';
          break;
        case 'gerenteProjetos':
          columnName = 'gerente_projetos';
          break;
        case 'liderProjetosTI':
          columnName = 'lider_projetos_ti';
          break;
        default:
          return false;
      }

      const { data, error } = await supabase
        .from('projetos')
        .select('id')
        .eq(columnName, optionValue)
        .limit(1);

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar uso da opção:', error);
      return true; // Em caso de erro, assumir que está em uso para segurança
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [fieldName]);

  return {
    options,
    loading,
    addOption,
    removeOption,
    refetch: fetchOptions
  };
};
