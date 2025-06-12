import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-10 animate-fade-in">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full blur-lg opacity-20 scale-110"></div>
              <img alt="Araguaia Logo" src="/lovable-uploads/5b4f69cb-7e93-4a3d-b30a-93c20af85bea.png" className="h-16 w-auto object-contain relative z-10 drop-shadow-lg" />
            </div>
            <img alt="IT Project Hub Logo" src="/lovable-uploads/70455ceb-ee1d-4c29-9247-59f4b6e625d9.png" className="h-40 w-auto object-contain drop-shadow-md" />
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {isLogin ? 'Faça login para continuar' : 'Preencha os dados para criar sua conta'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-700 font-medium text-sm">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} required={!isLogin} className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary transition-colors" placeholder="Digite seu nome completo" />
                </div>
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary transition-colors" placeholder="Digite seu e-mail" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary focus:ring-primary transition-colors" placeholder="Digite sua senha" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {isLogin && <div className="text-right">
                <Button type="button" variant="link" onClick={() => setShowForgotPassword(true)} className="text-sm p-0 h-auto font-medium hover:underline text-primary">
                  Esqueci minha senha
                </Button>
              </div>}
            
            <Button type="submit" className="w-full h-12 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none bg-primary hover:bg-primary/90" disabled={loading}>
              <div className="flex items-center justify-center space-x-2">
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <span>{loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}</span>
              </div>
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>
            
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm font-medium hover:underline text-primary">
              {isLogin ? 'Não tem conta? Criar uma nova' : 'Já tem conta? Fazer login'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>;
};