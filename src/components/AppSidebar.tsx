
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
import { Home, PieChart, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const isOverviewActive = ['overview', 'detail', 'report'].includes(currentView);
  const isDashboardActive = currentView === 'dashboard';
  const isUsersActive = currentView === 'users';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2 hidden md:flex items-center group-data-[state=expanded]:border-b">
        <SidebarTrigger variant="outline" className="ml-auto" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onShowOverview} isActive={isOverviewActive} tooltip="Início">
              <Home className={cn(
                "transition-colors",
                isOverviewActive
                  ? "text-sidebar-accent-foreground"
                  : "text-blue-500 group-hover/menu-item:text-sidebar-accent-foreground"
              )} />
              <span>Início</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onShowDashboard} isActive={isDashboardActive} tooltip="Dashboard">
              <PieChart className={cn(
                "transition-colors",
                isDashboardActive
                  ? "text-sidebar-accent-foreground"
                  : "text-green-500 group-hover/menu-item:text-sidebar-accent-foreground"
              )} />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {canManageUsers && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onShowUserManagement} isActive={isUsersActive} tooltip="Usuários">
                <UsersRound className={cn(
                  "transition-colors",
                  isUsersActive
                    ? "text-sidebar-accent-foreground"
                    : "text-purple-500 group-hover/menu-item:text-sidebar-accent-foreground"
                )} />
                <span>Usuários</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
