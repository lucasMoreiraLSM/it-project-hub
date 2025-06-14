
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users } from 'lucide-react';

type AppView = 'overview' | 'detail' | 'report' | 'dashboard' | 'users';

interface AppSidebarProps {
  onShowDashboard: () => void;
  onShowUserManagement: () => void;
  canManageUsers: boolean;
  currentView: AppView;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onShowDashboard,
  onShowUserManagement,
  canManageUsers,
  currentView
}) => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onShowDashboard} isActive={currentView === 'dashboard'} tooltip="Dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {canManageUsers && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onShowUserManagement} isActive={currentView === 'users'} tooltip="Usuários">
                <Users />
                <span>Usuários</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
