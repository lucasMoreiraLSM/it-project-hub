import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileModal } from './auth/UserProfileModal';
export const ProjectHeader = () => {
  const {
    user,
    signOut
  } = useAuth();
  const [showUserProfile, setShowUserProfile] = useState(false);
  return <div className="border-b border-gray-200 bg-[#183989] my-0 mx-0 py-0 px-[5px] rounded-lg">
      <div className="flex justify-between items-center w-full bg-[#00050e]/[0.43] mx-0 my-0 py-0 px-0">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/6002a9d0-aa98-4ed0-8082-a7e6ec5fc014.png" alt="Logo Araguaia" className="h-12 w-auto" />
          <img src="/lovable-uploads/20020c57-14d3-4551-ad46-f00eaccafa93.png" alt="IT Project Hub" className="h-28 object-contain" />
        </div>
        
        {user && <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 bg-slate-50 px-0 py-0 my-0 rounded-full" />
              <span className="text-slate-50">{user.email}</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setShowUserProfile(true)} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Perfil
            </Button>
            
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>}
      </div>

      <UserProfileModal isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </div>;
};