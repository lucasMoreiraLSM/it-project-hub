import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
export const ProjectHeader = () => {
  const {
    user,
    signOut
  } = useAuth();
  return <div className="border-b border-gray-200 px-6 py-4 bg-[183989_] bg-[#183989]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-50">IT Project Hub - Tecnologia da informação </h1>
        
        {user && <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 bg-slate-50 px-0 py-0 my-0 rounded-full" />
              <span className="text-slate-50">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>}
      </div>
    </div>;
};