
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileModal } from './auth/UserProfileModal';

export const ProjectHeader = () => {
  const { user, signOut } = useAuth();
  const [showUserProfile, setShowUserProfile] = useState(false);

  return (
    <div className="border-b border-gray-200 px-6 py-4 bg-[183989_] bg-[#183989]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl text-slate-50 mx-0 my-0 px-0 py-0 font-extrabold">
          IT Project Hub - Gestão de Projetos 
        </h1>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 bg-slate-50 px-0 py-0 my-0 rounded-full" />
              <span className="text-slate-50">{user.email}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowUserProfile(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Perfil
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut} 
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        )}
      </div>

      <UserProfileModal 
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </div>
  );
};
