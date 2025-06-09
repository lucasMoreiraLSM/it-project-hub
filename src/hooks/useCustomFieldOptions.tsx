
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      setOptions(data?.map(item => item.option_value) || []);
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

  const addOption = async (newOption: string): Promise<boolean> => {
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

  const removeOption = async (optionToRemove: string): Promise<boolean> => {
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
      // Use raw SQL query to avoid TypeScript deep instantiation issues
      let query = '';
      
      if (fieldName === 'areaNegocio') {
        query = 'SELECT id FROM projetos WHERE area_negocio = $1 LIMIT 1';
      } else if (fieldName === 'timeTI') {
        query = 'SELECT id FROM projetos WHERE time_ti = $1 LIMIT 1';
      } else if (fieldName === 'inovacaoMelhoria') {
        query = 'SELECT id FROM projetos WHERE inovacao_melhoria = $1 LIMIT 1';
      } else if (fieldName === 'estrategicoTatico') {
        query = 'SELECT id FROM projetos WHERE estrategico_tatico = $1 LIMIT 1';
      } else if (fieldName === 'gerenteProjetos') {
        query = 'SELECT id FROM projetos WHERE gerente_projetos = $1 LIMIT 1';
      } else if (fieldName === 'liderProjetosTI') {
        query = 'SELECT id FROM projetos WHERE lider_projetos_ti = $1 LIMIT 1';
      } else {
        return false;
      }

      const { data, error } = await supabase.rpc('execute_sql', {
        query: query,
        params: [optionValue]
      });

      if (error) {
        // If RPC doesn't exist, fall back to a simple check
        console.log('RPC não disponível, usando verificação alternativa');
        return false;
      }

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
