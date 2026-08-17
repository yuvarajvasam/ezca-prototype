import React, { useState } from 'react';
import { StaffMember } from '../../types';
import { UserCog, UserPlus, Search, Shield } from 'lucide-react';

interface StaffManagementViewProps {
  staffList: StaffMember[];
  onInviteStaff: (name: string, email: string, mobile: string, permissions: string[]) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({ staffList, onInviteStaff }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  const allAvailablePermissions = [
    { id: 'clients:read', label: 'View Clients Directory' },
    { id: 'clients:create', label: 'Create New Clients' },
    { id: 'filings:read', label: 'View Tax Filings' },
    { id: 'filings:update', label: 'Update Filing Status' },
    { id: 'documents:read', label: 'View Client Uploaded Documents' },
    { id: 'documents:approve', label: 'Approve Uploaded Documents' },
    { id: 'documents:reject', label: 'Reject / Request Replacements' },
    { id: 'payments:read', label: 'View Payments & Vault Status' },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'clients:read',
    'filings:read',
    'documents:read',
    'documents:approve',
    'documents:reject',
  ]);

  const filteredStaff = staffList.filter((staff) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (staff.name || '').toLowerCase().includes(q) ||
      (staff.email || '').toLowerCase().includes(q) ||
      (staff.mobile || '').includes(q) ||
      (staff.permissions || []).some((p) => (p || '').toLowerCase().includes(q));

    const matchesRole =
      roleFilter === 'ALL'
        ? true
        : roleFilter === 'ACTIVE'
        ? (staff.status || '').toUpperCase() === 'ACTIVE'
        : (staff.permissions || []).some((p) => (p || '').toLowerCase().startsWith((roleFilter || '').toLowerCase()));

    return matchesSearch && matchesRole;
  });

  const handleTogglePerm = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onInviteStaff(name, email, mobile, selectedPermissions);
    setShowInviteModal(false);
    setName('');
    setEmail('');
    setMobile('');
  };

  return (
    <div className="space-y-4 w-full pb-10">
      
      {/* Section Header Row */}
      <div className="-mx-4 -mt-4 px-4 h-[46px] border-b border-border/70 flex items-center justify-between mb-4 bg-background">
        <div className="flex items-center space-x-3">
          <h1 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">Staff</h1>
          <span className="text-[13px] font-normal text-muted-foreground">/ practice team</span>
        </div>

        <button
          id="btn-invite-staff-modal"
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-primary-foreground px-2 h-[25px] rounded-[4px] text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
        >
          <UserPlus className="w-3 h-3" />
          <span>Invite Staff</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 bg-card border border-border/70 rounded-xl p-2.5 shadow-2xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Team' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'filings', label: 'Filings Access' },
            { id: 'documents', label: 'Docs Access' },
            { id: 'payments', label: 'Payments Access' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 h-[28px] rounded-[6px] text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/70 rounded-[6px] pl-8 pr-2.5 h-[28px] text-[12px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-card border border-border/70 rounded-[8px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-muted/30 border-b border-border/60 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">
              <tr>
                <th className="px-4 py-3 font-semibold">Staff Member</th>
                <th className="px-4 py-3 font-semibold">Contact Info</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                    No staff members found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-foreground">{staff.name}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-foreground">{staff.email}</div>
                      <div className="text-muted-foreground text-[12px] mt-0.5">{staff.mobile}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-[4px] uppercase">
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {staff.permissions.map((p) => (
                          <span key={p} className="bg-background text-muted-foreground font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] border border-border/60 font-semibold uppercase tracking-wider">
                            {p.split(':')[1]} {p.split(':')[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitInvite} className="bg-card border border-border/70 rounded-[8px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-[15px] leading-[20px] font-semibold text-foreground flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span>Invite Staff Member</span>
              </h2>
              <button type="button" onClick={() => setShowInviteModal(false)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-[4px] hover:bg-muted/80 cursor-pointer">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Staff Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">Email <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@kotharitax.in"
                  className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">Mobile</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98200 54321"
                  className="w-full bg-background border border-border/70 text-foreground text-[13px] rounded-[6px] px-3 h-[36px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Permitted Capabilities</label>
              <div className="space-y-0 max-h-40 overflow-y-auto border border-border/70 rounded-[6px] bg-background divide-y divide-border/60">
                {allAvailablePermissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      onClick={() => handleTogglePerm(perm.id)}
                      className="flex items-center justify-between p-2.5 text-[13px] cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-foreground">{perm.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded-[4px] border-border/60 text-foreground focus:ring-0"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border/60">
              <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 h-[34px] rounded-[6px] text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="bg-foreground hover:bg-foreground/90 text-background px-4 h-[34px] rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer">
                Send Staff Invitation
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

