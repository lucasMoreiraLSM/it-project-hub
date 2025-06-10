import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordModal } from './ForgotPasswordModal';
export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta."
        });
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: nome
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta."
        });
      }
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
  return <div className="min-h-screen flex items-center justify-center p-6" style={{
    backgroundColor: '#183989'
  }}>
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center pb-4 rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <img alt="Araguaia Logo" className="h-20 w-auto object-contain" src="/lovable-uploads/5b4f69cb-7e93-4a3d-b30a-93c20af85bea.png" />
            
          </div>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <div>
                <Label htmlFor="nome" className="text-gray-700">Nome</Label>
                <Input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} required={!isLogin} className="mt-1" />
              </div>}
            
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" placeholder="ID usuár." />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-700">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" placeholder="Senha" />
            </div>
            
            {isLogin && <div className="text-right">
                <Button type="button" variant="link" onClick={() => setShowForgotPassword(true)} className="text-sm p-0" style={{
              color: '#183989'
            }}>
                  Esqueci minha senha
                </Button>
              </div>}
            
            <Button type="submit" className="w-full text-white font-medium py-3 mt-6" style={{
            backgroundColor: '#183989'
          }} disabled={loading}>
              {loading ? 'Carregando...' : isLogin ? 'Logon' : 'Criar Conta'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm" style={{
            color: '#183989'
          }}>
              {isLogin ? 'Não tem conta? Criar uma nova' : 'Já tem conta? Fazer login'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>;
};