
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser } from '@/hooks/useAuth';

export const useUserProfileForm = (user: AuthUser | null, isOpen: boolean, onClose: () => void) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        nome: user.profile?.nome || ''
      }));
    }
  }, [user, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "E-mail é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { nome: formData.nome }
      });
      
      if (updateError) throw updateError;

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ nome: formData.nome, updated_at: new Date().toISOString() })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
      }

      if (formData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: "Atenção",
          description: "Um e-mail de confirmação foi enviado para o novo endereço."
        });
      }

      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (passwordError) throw passwordError;
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit
  };
};
