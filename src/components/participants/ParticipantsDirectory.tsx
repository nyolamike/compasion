import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  SearchIcon,
  FilterIcon,
  UsersIcon,
  MapPinIcon,
  MailIcon,
  StarIcon,
  TrainingIcon,
  EyeIcon,
  XIcon,
  TrendingUpIcon,
  PlusIcon,
} from '@/components/icons/Icons';

const regions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
];

const ParticipantsDirectory: React.FC = () => {
  const { participants } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<typeof participants[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.organization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === 'all' || p.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const stats = {
    total: participants.length,
    avgScore: participants.length > 0 ? Math.round(participants.reduce((acc, p) => acc + (p.average_score || 0), 0) / participants.length) : 0,
    totalTrainings: participants.reduce((acc, p) => acc + (p.trainings_attended || 0), 0),
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Participants Directory</h1>
          <p className="text-slate-500 mt-1">Manage and view participant profiles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
        >
          <PlusIcon size={20} />
          Add Participant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-600 font-medium">Total Participants</p>
              <p className="text-3xl font-bold text-teal-700 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <UsersIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Average Score</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{stats.avgScore}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUpIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Total Trainings Attended</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{stats.totalTrainings}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <TrainingIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-slate-400" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredParticipants.map((participant) => (
          <div
            key={participant.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(participant.name || '').split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{participant.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{participant.role}</p>
                  <p className="text-xs text-slate-400 truncate">{participant.organization}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${getScoreColor(participant.average_score || 0)}`}>
                  {participant.average_score || 0}%
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MailIcon size={14} className="text-slate-400" />
                  <span className="truncate">{participant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPinIcon size={14} className="text-slate-400" />
                  <span>{participant.region}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <TrainingIcon size={14} className="text-slate-400" />
                  <span>{participant.trainings_attended || 0} trainings attended</span>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedParticipant(participant)}
                className="flex items-center gap-2 px-3 py-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium"
              >
                <EyeIcon size={16} />
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <UsersIcon size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-lg font-medium text-slate-800">No participants found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Profile Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Participant Profile</h2>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedParticipant.name || '').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{selectedParticipant.name}</h3>
                  <p className="text-slate-500">{selectedParticipant.role}</p>
                  <p className="text-sm text-slate-400">{selectedParticipant.organization}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500">Average Score</p>
                  <p className={`text-2xl font-bold ${(selectedParticipant.average_score || 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedParticipant.average_score || 0}%
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500">Trainings Attended</p>
                  <p className="text-2xl font-bold text-slate-800">{selectedParticipant.trainings_attended || 0}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MailIcon size={18} className="text-slate-400" />
                  <span className="text-slate-700">{selectedParticipant.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MapPinIcon size={18} className="text-slate-400" />
                  <span className="text-slate-700">{selectedParticipant.region}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsDirectory;
