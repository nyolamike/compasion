import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  XIcon,
  TrainingIcon,
} from '@/components/icons/Icons';

type UserRole = 'administrator' | 'manager' | 'coordinator' | 'facilitator';

const LoginModal: React.FC = () => {
  const { showLoginModal, setShowLoginModal, login, users } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('coordinator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!showLoginModal) return null;

  const roles: { role: UserRole; label: string; description: string }[] = [
    { role: 'administrator', label: 'Administrator', description: 'Full system access and configuration' },
    { role: 'manager', label: 'Manager, Program Training', description: 'Approve plans and view reports' },
    { role: 'coordinator', label: 'Training Coordinator', description: 'Create plans and schedule sessions' },
    { role: 'facilitator', label: 'Facilitator', description: 'Conduct trainings and record attendance' },
  ];

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const success = await login(email, password, selectedRole);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError('');
    try {
      const success = await login('', '', role);
      if (!success) {
        setError('Failed to login. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrainingIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">TrainHub</h2>
                <p className="text-sm text-slate-300">Sign in to continue</p>
              </div>
            </div>
            <button
              onClick={() => setShowLoginModal(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {/* Quick Role Selection */}
        <div className="p-6 border-b border-slate-100">
          <p className="text-sm text-slate-600 mb-3">Quick access - Select a role:</p>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => handleQuickLogin(r.role)}
                disabled={isLoading}
                className={`p-3 rounded-xl border-2 text-left transition-all hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50 ${
                  selectedRole === r.role ? 'border-teal-500 bg-teal-50' : 'border-slate-200'
                }`}
              >
                <p className="font-medium text-slate-800 text-sm">{r.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 text-center">Or sign in with credentials</p>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {roles.map(r => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        {/* Demo Note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-slate-400 text-center">
            Demo mode: Click any role button above to sign in instantly
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
