import React, { useState } from 'react';
import { User, Tenant } from '../types';
import {
  Building2,
  Smartphone,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  User as UserIcon,
  LayoutDashboard,
  Globe,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';

interface HeaderNavbarProps {
  tenant: Tenant;
  currentUser?: User;
  onSelectUser?: (userId: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  allUsers?: User[];
  activeRole?: 'admin' | 'client';
  onSwitchRole?: (role: 'admin' | 'client') => void;
  onOpenV2Modal?: () => void;
  onOpenBrandGuidelines?: () => void;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onLogout?: () => void;
}

const defaultUsers: User[] = [
  { id: 'user-ca-admin', tenantId: 't1', mobile: '+91 98200 12345', email: 'ca.kothari@kotharitax.in', name: 'CA Rajesh Kothari', role: 'CA_ADMIN' },
  { id: 'user-client-1', tenantId: 't1', mobile: '+91 98765 43210', email: 'yuvaraj.vasam@example.com', name: 'Yuvaraj Vasam', role: 'CLIENT' },
];

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  tenant,
  currentUser,
  onSelectUser,
  activeTab,
  setActiveTab,
  allUsers = defaultUsers,
  activeRole = 'admin',
  onSwitchRole,
  onOpenV2Modal,
  onOpenBrandGuidelines,
  currentTheme = 'dark',
  onToggleTheme,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const effectiveRole = activeRole || (currentUser?.role === 'CLIENT' ? 'client' : 'admin');
  const user = currentUser || (effectiveRole === 'client' ? defaultUsers[2] : defaultUsers[0]);

  const handleSwitchToAdmin = (tabName: string = 'dashboard') => {
    if (onSwitchRole) onSwitchRole('admin');
    if (setActiveTab) setActiveTab(tabName);
    if (onSelectUser) {
      const caUser = allUsers.find((u) => u.role === 'CA_ADMIN') || defaultUsers[0];
      onSelectUser(caUser.id);
    }
  };

  const handleSwitchToClient = () => {
    if (onSwitchRole) onSwitchRole('client');
    if (setActiveTab) setActiveTab('client_app');
    if (onSelectUser) {
      const clientUser = allUsers.find((u) => u.role === 'CLIENT') || defaultUsers[2];
      onSelectUser(clientUser.id);
    }
  };

  return (
    <header id="caportal-header" className="bg-card border-b border-border/60 sticky top-0 z-40 h-[60px] min-h-[60px] flex items-center px-4 justify-between select-none">
      
      {/* Left: App Brand & High-Level Navigation Items */}
      <div className="flex items-center space-x-6">
        
        {/* Brand Title "ezca" with Square Grid Logo */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={() => handleSwitchToAdmin('dashboard')}
        >
          <div className="w-8 h-8 rounded-[6px] bg-primary text-primary-foreground grid grid-cols-2 p-0.5 gap-[2px] font-bold text-[10px] items-center justify-items-center transition-transform group-hover:scale-105 shadow-2xs">
            <span className="flex items-center justify-center w-full h-full bg-primary-foreground/15 rounded-[2px]">E</span>
            <span className="flex items-center justify-center w-full h-full bg-primary-foreground/15 rounded-[2px]">Z</span>
            <span className="flex items-center justify-center w-full h-full bg-primary-foreground/15 rounded-[2px]">C</span>
            <span className="flex items-center justify-center w-full h-full bg-primary-foreground/15 rounded-[2px]">A</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[15px] leading-[20px] tracking-tight text-foreground uppercase">ezca</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 rounded-[4px]">
                AY 2026–27
              </span>
            </div>
            <span className="text-[11px] leading-[14px] text-muted-foreground truncate max-w-[180px]">
              {tenant?.brandName || 'Kothari & Associates Tax Vault'}
            </span>
          </div>
        </div>

        {/* High-Level View Items: Segmented Portal Switcher */}
        <nav className="hidden md:flex items-center bg-muted/60 p-1 rounded-[8px] border border-border/80 text-[12px] font-semibold">
          <button
            onClick={() => handleSwitchToAdmin('dashboard')}
            className={`flex items-center space-x-1.5 px-3 h-[28px] rounded-[6px] transition-all cursor-pointer ${
              effectiveRole === 'admin'
                ? 'bg-card text-foreground shadow-xs border border-border/90 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 ${effectiveRole === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Admin Portal</span>
          </button>

          <button
            onClick={handleSwitchToClient}
            className={`flex items-center space-x-1.5 px-3 h-[28px] rounded-[6px] transition-all cursor-pointer ${
              effectiveRole === 'client'
                ? 'bg-card text-foreground shadow-xs border border-border/90 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
            }`}
          >
            <Smartphone className={`w-3.5 h-3.5 ${effectiveRole === 'client' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Client Portal</span>
          </button>
        </nav>
      </div>

      {/* Right: Operational Status, Action Button, User Avatar Pill & Logout */}
      <div className="flex items-center space-x-2.5 text-[12px] relative">
        


        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-[32px] h-[32px] flex items-center justify-center text-muted-foreground hover:text-foreground rounded-[6px] hover:bg-muted/80 transition-colors border border-transparent hover:border-border/60 cursor-pointer"
            title="Toggle color theme"
          >
            {currentTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        )}

        {/* User Persona & Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-muted/40 hover:bg-muted/70 py-1 px-2 rounded-full border border-border/70 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left pr-0.5">
              <span className="font-semibold text-[12px] text-foreground leading-[13px] max-w-[120px] truncate">{user?.name || 'Taxpayer'}</span>
              <span className="text-[9px] text-muted-foreground leading-[11px] uppercase font-mono">
                {user?.role === 'CLIENT' ? 'Taxpayer' : user?.role === 'CA_STAFF' ? 'CA Staff' : 'CA Admin'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-[220px] bg-card border border-border/80 rounded-[8px] shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-[12px]">
              <div className="p-2 border-b border-border/60 mb-1">
                <div className="font-semibold text-foreground truncate">{user?.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email || user?.mobile}</div>
                <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                  {user?.role}
                </span>
              </div>

              <div className="py-0.5 space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  Switch Account
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (onSelectUser) onSelectUser(u.id);
                      if (u.role === 'CLIENT') {
                        if (onSwitchRole) onSwitchRole('client');
                      } else {
                        if (onSwitchRole) onSwitchRole('admin');
                      }
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-[4px] flex items-center justify-between transition-colors cursor-pointer ${
                      u.id === user?.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{u.role === 'CLIENT' ? 'Client' : 'CA'}</span>
                  </button>
                ))}
              </div>

              {onLogout && (
                <div className="pt-1 mt-1 border-t border-border/60">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[4px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explicit Log Out Icon Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1 px-2.5 h-[30px] rounded-[6px] text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border/60 hover:border-rose-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Log out</span>
          </button>
        )}

      </div>

    </header>
  );
};





