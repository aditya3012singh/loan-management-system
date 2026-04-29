'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { logoutUser, initializeAuth } from '@/store/authSlice';
import SalesView from '@/components/dashboard/SalesView';
import SanctionView from '@/components/dashboard/SanctionView';
import DisbursementView from '@/components/dashboard/DisbursementView';
import CollectionView from '@/components/dashboard/CollectionView';
import { LogOut, LayoutDashboard, Users, CheckSquare, Send, CreditCard, Menu, X } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (mounted) {
      if (!user) {
        router.push('/');
      } else if (!activeTab) {
        // Set default tab based on role
        if (user.role === 'Admin' || user.role === 'Sales') setActiveTab('Sales');
        else if (user.role === 'Sanction') setActiveTab('Sanction');
        else if (user.role === 'Disbursement') setActiveTab('Disbursement');
        else if (user.role === 'Collection') setActiveTab('Collection');
      }
    }
  }, [user, mounted, router, activeTab]);

  if (!mounted || !user) return null;

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  const navItems = [
    { id: 'Sales', label: 'Sales Overview', icon: Users, roles: ['Admin', 'Sales'] },
    { id: 'Sanction', label: 'Sanction Queue', icon: CheckSquare, roles: ['Admin', 'Sanction'] },
    { id: 'Disbursement', label: 'Disbursement', icon: Send, roles: ['Admin', 'Disbursement'] },
    { id: 'Collection', label: 'Collection', icon: CreditCard, roles: ['Admin', 'Collection'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const renderView = () => {
    switch (activeTab) {
      case 'Sales': return <SalesView />;
      case 'Sanction': return <SanctionView />;
      case 'Disbursement': return <DisbursementView />;
      case 'Collection': return <CollectionView />;
      default: return <div>Select a module</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#121212] border-r border-[#262626] transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-[#262626]">
            <LayoutDashboard className="text-gray-100 mr-3" size={24} />
            <h1 className="font-bold text-lg tracking-tight text-white">LMS Portal</h1>
          </div>
          
          <div className="p-6 border-b border-[#262626]">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Profile</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <p className="px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Modules</p>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-white text-black' 
                      : 'text-gray-400 hover:bg-[#1e1e1e] hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#262626]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1a1a1a] hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-[#262626] bg-[#121212] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-white" size={20} />
            <span className="font-semibold text-white">LMS Portal</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white bg-[#1a1a1a] rounded-md border border-[#262626]"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Desktop Topbar / Content Header */}
        <header className="hidden lg:flex h-16 border-b border-[#262626] bg-[#0a0a0a] items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-white">
            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
