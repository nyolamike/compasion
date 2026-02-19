import React from 'react';
import { useApp } from '@/context/AppContext';
import StatCard from './StatCard';
import {
  TrainingIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  MapPinIcon,
  PlusIcon,
  ChevronRightIcon,
} from '@/components/icons/Icons';
import { dashboardStats } from '@/data/mockData';

const regions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
];

const Dashboard: React.FC = () => {
  const { currentUser, trainingPlans, trainingSessions, participants, setCurrentView } = useApp();

  const upcomingTrainings = trainingPlans
    .filter(p => p.status === 'approved' && new Date(p.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  const recentActivities = [
    { id: 1, action: 'Training plan approved', item: 'Child Protection Fundamentals', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'New material uploaded', item: 'Leadership Principles Video', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Session completed', item: 'Financial Literacy Workshop', time: '1 day ago', type: 'success' },
    { id: 4, action: 'Feedback received', item: 'Health & Nutrition Training', time: '2 days ago', type: 'info' },
    { id: 5, action: 'Attendance recorded', item: 'Youth Leadership Day 1', time: '3 days ago', type: 'success' },
  ];

  const quickActions = [
    { id: 'new-plan', label: 'Create Training Plan', icon: <PlusIcon size={20} />, view: 'plans', color: 'bg-teal-500' },
    { id: 'upload-material', label: 'Upload Material', icon: <PlusIcon size={20} />, view: 'materials', color: 'bg-coral-500' },
    { id: 'schedule-session', label: 'Schedule Session', icon: <CalendarIcon size={20} />, view: 'sessions', color: 'bg-purple-500' },
    { id: 'view-reports', label: 'View Reports', icon: <TrendingUpIcon size={20} />, view: 'reports', color: 'bg-amber-500' },
  ];

  const regionStats = regions.map(region => ({
    name: region,
    trainings: trainingPlans.filter(p => p.region === region).length,
    participants: participants.filter(p => p.region === region).length,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {currentUser?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-slate-300 mt-1">Here's what's happening with your training programs today.</p>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xs text-slate-300">Today's Sessions</p>
              <p className="text-xl font-bold">3</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xs text-slate-300">Pending Approvals</p>
              <p className="text-xl font-bold">{dashboardStats.pendingApprovals}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xs text-slate-300">This Month</p>
              <p className="text-xl font-bold">8 Trainings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Trainings"
          value={dashboardStats.totalTrainings}
          subtitle="This year"
          icon={<TrainingIcon size={24} />}
          trend={{ value: 12, isPositive: true }}
          color="teal"
          onClick={() => setCurrentView('plans')}
        />
        <StatCard
          title="Participants Trained"
          value={dashboardStats.totalParticipants.toLocaleString()}
          subtitle="Across all regions"
          icon={<UsersIcon size={24} />}
          trend={{ value: 8, isPositive: true }}
          color="coral"
          onClick={() => setCurrentView('participants')}
        />
        <StatCard
          title="Avg. Attendance"
          value={`${dashboardStats.averageAttendance}%`}
          subtitle="Last 30 days"
          icon={<CheckCircleIcon size={24} />}
          trend={{ value: 3, isPositive: true }}
          color="amber"
          onClick={() => setCurrentView('attendance')}
        />
        <StatCard
          title="Satisfaction Score"
          value={dashboardStats.averageSatisfaction}
          subtitle="Out of 5.0"
          icon={<TrendingUpIcon size={24} />}
          trend={{ value: 5, isPositive: true }}
          color="purple"
          onClick={() => setCurrentView('reports')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trainings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Upcoming Trainings</h3>
            <button 
              onClick={() => setCurrentView('sessions')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View All <ChevronRightIcon size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingTrainings.length > 0 ? upcomingTrainings.map((training) => (
              <div key={training.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-teal-600">
                      {new Date(training.start_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-teal-700">
                      {new Date(training.start_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{training.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPinIcon size={14} />
                        {training.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon size={14} />
                        {training.participant_count} participants
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    training.training_type === 'In-Person' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : training.training_type === 'Virtual/Zoom'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {training.training_type}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                <CalendarIcon size={40} className="mx-auto text-slate-300 mb-2" />
                <p>No upcoming trainings scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setCurrentView(action.view)}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-600 text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm text-slate-800">{activity.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.item}</p>
                      <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Regional Overview</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {regionStats.map((region) => (
              <div key={region.name} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon size={16} className="text-teal-500" />
                  <h4 className="font-medium text-slate-700 text-sm">{region.name}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Trainings</span>
                    <span className="font-semibold text-slate-800">{region.trainings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Participants</span>
                    <span className="font-semibold text-slate-800">{region.participants}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
