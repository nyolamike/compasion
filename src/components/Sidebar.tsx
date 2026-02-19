import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  DashboardIcon,
  TrainingIcon,
  UsersIcon,
  CalendarIcon,
  FolderIcon,
  BuildingIcon,
  ClipboardIcon,
  ChartIcon,
  TargetIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronRightIcon,
} from '@/components/icons/Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: number;
}

const Sidebar: React.FC = () => {
  const { currentUser, currentView, setCurrentView, sidebarOpen, logout, trainingPlans, trainingMaterials } = useApp();
  
  const pendingApprovals = trainingPlans.filter(p => p.status === 'submitted').length + 
                           trainingMaterials.filter(m => m.status === 'submitted').length;



  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon size={20} />, roles: ['administrator', 'manager', 'coordinator', 'facilitator'] },
    { id: 'needs', label: 'Training Needs', icon: <TargetIcon size={20} />, roles: ['administrator', 'coordinator'] },
    { id: 'plans', label: 'Training Plans', icon: <TrainingIcon size={20} />, roles: ['administrator', 'manager', 'coordinator'] },
    { id: 'materials', label: 'Materials Library', icon: <FolderIcon size={20} />, roles: ['administrator', 'manager', 'coordinator', 'facilitator'] },
    { id: 'facilities', label: 'Facilities', icon: <BuildingIcon size={20} />, roles: ['administrator', 'coordinator'] },
    { id: 'sessions', label: 'Sessions', icon: <CalendarIcon size={20} />, roles: ['administrator', 'manager', 'coordinator', 'facilitator'] },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardIcon size={20} />, roles: ['administrator', 'coordinator', 'facilitator'] },
    { id: 'evaluation', label: 'Evaluation', icon: <ClipboardIcon size={20} />, roles: ['administrator', 'manager', 'coordinator', 'facilitator'] },
    { id: 'participants', label: 'Participants', icon: <UsersIcon size={20} />, roles: ['administrator', 'manager', 'coordinator'] },
    { id: 'approvals', label: 'Approvals', icon: <ChartIcon size={20} />, roles: ['administrator', 'manager'], badge: pendingApprovals },
    { id: 'reports', label: 'Reports', icon: <ChartIcon size={20} />, roles: ['administrator', 'manager', 'coordinator'] },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} />, roles: ['administrator'] },
  ];


  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const handleNavClick = (id: string) => {
    setCurrentView(id);
  };

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrainingIcon size={24} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg leading-tight">TrainHub</h1>
              <p className="text-xs text-slate-400">Uganda Operations</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {filteredNavItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 border-l-2 border-teal-400'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className={`flex-shrink-0 ${currentView === item.id ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-coral-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRightIcon size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${currentView === item.id ? 'opacity-100' : ''}`} />
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      {currentUser && (
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-sm text-slate-300"
            >
              <LogoutIcon size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
