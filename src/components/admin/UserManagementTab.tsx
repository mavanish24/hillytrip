import React, { useState } from 'react';
import { 
  Users, Search, ShieldCheck, ShieldAlert, UserCheck, 
  UserX, Key, Eye, Filter, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface UserManagementTabProps {
  users: AdminUser[];
  onUpdateStatus: (userId: string, status: AdminUser['status']) => void;
  onToggleVerify: (userId: string) => void;
  onRefresh: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  onUpdateStatus,
  onToggleVerify,
  onRefresh
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search/Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Platform User Management & Access Control
            </h2>
            <p className="text-xs text-slate-400">Manage account permissions, verification badges, and account suspensions across all user tiers.</p>
          </div>

          <button 
            onClick={onRefresh}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Directory
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input 
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All User Roles</option>
              <option value="traveller">Traveller</option>
              <option value="business_owner">Business Owner</option>
              <option value="taxi_operator">Taxi Operator</option>
              <option value="homestay_owner">Homestay Owner</option>
              <option value="guide">Guide</option>
              <option value="content_editor">Content Editor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">User Details</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">District / State</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No matching users found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email} • {user.phone}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {user.district ? `${user.district}, ${user.state}` : 'N/A'}
                    </td>

                    <td className="px-4 py-3">
                      {user.status === 'active' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Suspended
                        </span>
                      )}
                      {user.status === 'pending_verification' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {user.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => onToggleVerify(user.id)}
                        title="Toggle Verification"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      {user.status === 'active' ? (
                        <button
                          onClick={() => onUpdateStatus(user.id, 'suspended')}
                          title="Suspend User"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(user.id, 'active')}
                          title="Activate User"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedUser(user)}
                        title="View Full Profile"
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">User Audit Profile</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500">Name:</span> <span className="font-bold text-white">{selectedUser.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span> <span>{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span> <span>{selectedUser.phone}</span>
              </div>
              <div>
                <span className="text-slate-500">Role:</span> <span className="uppercase font-bold text-indigo-400">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-slate-500">Member Since:</span> <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Platform Bookings:</span> <span className="font-bold text-white">{selectedUser.totalBookingsCount || 0}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
