
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AcceptInvite = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');

    // Se não houver token de acesso na URL, o link é inválido.
    if (!accessToken) {
      toast({
        title: 'Link Inválido',
        description: 'O link de convite parece estar quebrado ou incompleto. Por favor, use o link do seu e-mail.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Usamos o token para obter os dados do usuário sem iniciar uma sessão.
    supabase.auth.getUser(accessToken).then(({ data: { user }, error }) => {
      if (error || !user) {
        toast({
          title: 'Erro',
          description: 'O link de convite é inválido ou expirou.',
          variant: 'destructive',
        });
        navigate('/login');
      } else {
        setEmail(user.email || '');
        if (user.user_metadata && user.user_metadata.nome) {
          setNome(user.user_metadata.nome);
        }
      }
    });
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword || !nome) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      toast({
        title: 'Erro de Sessão',
        description: 'Seu link de convite expirou ou é inválido. Por favor, tente novamente a partir do e-mail.',
        variant: 'destructive',
      });
      setLoading(false);
      navigate('/login');
      return;
    }
    
    try {
      // 1. Inicia a sessão com os tokens do link
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (sessionError) throw new Error('Falha ao autenticar. O link pode ter expirado.');
      
      // 2. Com o usuário autenticado, atualiza a senha e o nome
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { nome: nome }
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Sucesso",
        description: "Cadastro finalizado com sucesso! Você será redirecionado."
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar cadastro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#183989' }}>
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center space-y-4">
            <img 
              alt="Araguaia Logo" 
              className="h-20 w-auto object-contain" 
              src="/lovable-uploads/5b4f69cb-7e93-4a3d-b30a-93c20af85bea.png" 
            />
            <CardTitle className="text-2xl font-serif text-gray-800 tracking-wide">
              Finalizar Cadastro
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="mt-1 bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="nome" className="text-gray-700">Nome</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1"
                placeholder="Digite seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="text-gray-700">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Digite sua nova senha"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-gray-700">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Confirme sua nova senha"
              />
            </div>
            <Button
              type="submit"
              className="w-full text-white font-medium py-3 mt-6"
              style={{ backgroundColor: '#183989' }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar e Acessar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
