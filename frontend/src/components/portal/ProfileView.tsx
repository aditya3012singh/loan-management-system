'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { User, Mail, ShieldAlert } from 'lucide-react';

export default function ProfileView() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h2 className="text-xl font-semibold text-white">My Profile</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-[#121212] border border-[#262626] rounded-2xl p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-3xl font-bold text-white mb-4">
            {user.name.charAt(0)}
          </div>
          <h3 className="text-xl font-semibold text-white">{user.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{user.role}</p>
          
          <div className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-gray-400 bg-[#0a0a0a] border border-[#262626] py-2 px-4 rounded-lg">
            <Mail size={16} className="text-gray-500" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-[#121212] border border-[#262626] rounded-2xl p-8">
          <h3 className="text-sm font-semibold mb-6 text-gray-300 uppercase tracking-wider border-b border-[#262626] pb-2">Account Details</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Full Name</p>
                <p className="text-sm text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Email Address</p>
                <p className="text-sm text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Role</p>
                <p className="text-sm text-white">{user.role}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Account ID</p>
                <p className="text-sm text-gray-400 font-mono">{user._id}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-medium text-amber-500 mb-1">Data Privacy</h4>
              <p className="text-xs text-amber-500/70 leading-relaxed">
                Your personal details, including PAN and salary information submitted during loan applications, are securely encrypted. The Operations team only accesses required details for verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
