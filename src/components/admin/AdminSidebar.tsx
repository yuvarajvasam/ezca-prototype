import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  Receipt,
  Bell,
  Calculator,
  PieChart,
  FileCheck,
  Grid,
  Settings,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  documentCount?: number;
  invoiceCount?: number;
  clientCount?: number;
  deadlineCount?: number;
  reminderCount?: number;
  ackCount?: number;
  templateCount?: number;
  urgentCount?: number;
  pendingDocsCount?: number;
  hideToolsSection?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  documentCount = 19,
  invoiceCount = 4,
  clientCount = 30,
  deadlineCount = 6,
  reminderCount = 3,
  ackCount = 5,
  templateCount = 4,
  hideToolsSection = false,
}) => {
  const handleNavigate = (id: string) => {
    if (onSelectTab) {
      onSelectTab(id);
    } else if (setActiveTab) {
      setActiveTab(id);
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const overviewItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users, badge: clientCount },
  ];

  const workflowItems: NavItem[] = [
    { id: 'documents', label: 'Documents', icon: FileText, badge: documentCount },
    { id: 'deadlines', label: 'Deadlines', icon: Clock, badge: deadlineCount },
    { id: 'invoices', label: 'Invoices', icon: Receipt, badge: invoiceCount },
    { id: 'reminders', label: 'Reminders', icon: Bell, badge: reminderCount },
    { id: 'ack-tracker', label: 'Acknowledgements', icon: FileCheck, badge: ackCount },
  ];

  const toolsItems: NavItem[] = [
    { id: 'tax-compute', label: 'Tax Calculator', icon: Calculator },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: PieChart },
    { id: 'templates', label: 'Templates', icon: Grid, badge: templateCount },
  ];

  const systemItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {title && (
          <div className="px-2 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            {title}
          </div>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavigate(item.id)}
              className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary/10 text-foreground font-semibold border border-primary/25 shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent'
              }`}
            >
              {/* Active subtle left accent indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
              )}

              <div className="flex items-center space-x-2 truncate pl-0.5">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-foreground'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary font-bold'
                      : 'bg-muted/80 text-muted-foreground border border-border/50 group-hover:bg-muted group-hover:text-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="w-[200px] shrink-0 bg-card border-r border-border/70 h-full flex flex-col justify-between p-2.5 select-none overflow-y-auto z-30">
      <div className="space-y-2">
        {/* Navigation Sections */}
        <div className="space-y-1.5">
          {renderNavGroup('Overview', overviewItems)}
          {renderNavGroup('Workflow', workflowItems)}
          {!hideToolsSection && renderNavGroup('Tools', toolsItems)}
          {renderNavGroup('System', systemItems)}
        </div>
      </div>

      {/* Bottom Account Widget with Usage Pill */}
      <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
        <div className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border/60 rounded-xl p-2 flex items-center justify-between cursor-pointer group">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/25">
              RM
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-[11px] text-foreground truncate group-hover:text-primary transition-colors">Rajesh Kotari</span>
              <span className="text-[9px] text-muted-foreground truncate">CA • Bengaluru</span>
            </div>
          </div>
          <span className="px-1 py-0.2 rounded-md text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
            6/30
          </span>
        </div>


      </div>
    </aside>
  );
};






