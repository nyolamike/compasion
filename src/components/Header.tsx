import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  WifiIcon,
  WifiOffIcon,
  RefreshIcon,
  ChevronDownIcon,
} from '@/components/icons/Icons';

const Header: React.FC = () => {
  const { 
    currentUser, 
    sidebarOpen, 
    setSidebarOpen, 
    isOnline, 
    setIsOnline, 
    pendingSyncCount,
    setShowLoginModal,
    currentView,
    syncData,
    isSyncing,
    refreshAllData,
    isLoading,
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    needs: 'Training Needs',
    plans: 'Training Plans',
    materials: 'Materials Library',
    facilities: 'Facilities',
    sessions: 'Training Sessions',
    attendance: 'Attendance',
    participants: 'Participants',
    approvals: 'Approvals',
    reports: 'Reports & Analytics',
    settings: 'Settings',
  };

  const notifications = [
    { id: 1, title: 'New training plan submitted', time: '5 min ago', unread: true },
    { id: 2, title: 'Material approved', time: '1 hour ago', unread: true },
    { id: 3, title: 'Session scheduled for tomorrow', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSync = async () => {
    if (isOnline && pendingSyncCount > 0) {
      await syncData();
    }
  };

  const handleRefresh = async () => {
    await refreshAllData();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MenuIcon size={20} className="text-slate-600" />
        </button>
        
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{viewTitles[currentView] || 'Dashboard'}</h2>
          <p className="text-xs text-slate-500">Welcome back, {currentUser?.name.split(' ')[0]}</p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainings, participants, materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshIcon size={18} className={`text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Online/Offline Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isOnline 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          {isOnline ? <WifiIcon size={16} /> : <WifiOffIcon size={16} />}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        {/* Sync Status */}
        {pendingSyncCount > 0 && (
          <button 
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-medium hover:bg-amber-100 disabled:opacity-50"
          >
            <RefreshIcon size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span>{pendingSyncCount} pending</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <BellIcon size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-coral-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${
                      notif.unread ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    <p className="text-sm text-slate-800">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <ChevronDownIcon size={16} className="text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                <div className="p-4 border-b border-slate-100">
                  <p className="font-semibold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-400 mt-1">{currentUser.region}</p>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                    Help & Support
                  </button>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="w-full text-left px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg font-medium"
                  >
                    Switch Role
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
