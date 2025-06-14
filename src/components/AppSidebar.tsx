
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Home, LayoutDashboard, Users } from 'lucide-react';

type AppView = 'overview' | 'detail' | 'report' | 'dashboard' | 'users';

interface AppSidebarProps {
  onShowOverview: () => void;
  onShowDashboard: () => void;
  onShowUserManagement: () => void;
  canManageUsers: boolean;
  currentView: AppView;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onShowOverview,
  onShowDashboard,
  onShowUserManagement,
  canManageUsers,
  currentView
}) => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2 hidden md:flex items-center group-data-[state=expanded]:border-b">
        <SidebarTrigger variant="outline" className="ml-auto" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onShowOverview} isActive={['overview', 'detail', 'report'].includes(currentView)} tooltip="Início">
              <Home />
              <span>Início</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
