import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DbTrainingNeed } from '@/lib/database';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  TargetIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  XIcon,
  UsersIcon,
  MailIcon,
} from '@/components/icons/Icons';

type TrainingSource = 'FCP Selected Interventions from FPP' | 'GMC/Regional Training Needs' | 'National Office Mandatory Trainings';

const TrainingNeeds: React.FC = () => {
  const { trainingNeeds, addTrainingNeed, participants } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'identified' | 'in-progress' | 'addressed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    participantId: '',
    needDescription: '',
    source: 'FCP Selected Interventions from FPP' as TrainingSource,
  });

  const filteredNeeds = trainingNeeds.filter(need => {
    const desc = (need.need_description || '').toLowerCase();
    const name = (need.participant_name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = desc.includes(query) || name.includes(query);
    const matchesStatus = statusFilter === 'all' || need.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DbTrainingNeed['status']) => {
    const styles = {
      identified: 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      addressed: 'bg-emerald-100 text-emerald-700',
    };
    const icons = {
      identified: <AlertCircleIcon size={14} />,
      'in-progress': <ClockIcon size={14} />,
      addressed: <CheckCircleIcon size={14} />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const handleAddNeed = async () => {
    const participant = participants.find(p => p.id === formData.participantId);
    if (!participant) return;

    try {
      await addTrainingNeed({
        participant_id: formData.participantId,
        participant_name: participant.name,
        participant_email: participant.email,
        need_description: formData.needDescription,
        source: formData.source,
        date_identified: new Date().toISOString().split('T')[0],
        status: 'identified',
      });
      setShowAddModal(false);
      setFormData({
        participantId: '',
        needDescription: '',
        source: 'FCP Selected Interventions from FPP',
      });
    } catch (err) {
      console.error('Failed to add training need:', err);
    }
  };

  const stats = {
    total: trainingNeeds.length,
    identified: trainingNeeds.filter(n => n.status === 'identified').length,
    inProgress: trainingNeeds.filter(n => n.status === 'in-progress').length,
    addressed: trainingNeeds.filter(n => n.status === 'addressed').length,
  };

  const sourceColors: Record<string, string> = {
    'FCP Selected Interventions from FPP': 'bg-teal-100 text-teal-700',
    'GMC/Regional Training Needs': 'bg-purple-100 text-purple-700',
    'National Office Mandatory Trainings': 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Training Needs</h1>
          <p className="text-slate-500 mt-1">Identify and track training needs across the organization</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
        >
          <PlusIcon size={20} />
          Add Training Need
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Needs</span>
            <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Identified</span>
            <span className="text-2xl font-bold text-amber-600">{stats.identified}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">In Progress</span>
            <span className="text-2xl font-bold text-blue-600">{stats.inProgress}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Addressed</span>
            <span className="text-2xl font-bold text-emerald-600">{stats.addressed}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search training needs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="identified">Identified</option>
            <option value="in-progress">In Progress</option>
            <option value="addressed">Addressed</option>
          </select>
        </div>
      </div>

      {/* Needs List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filteredNeeds.map((need) => (
            <div key={need.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TargetIcon size={24} className="text-teal-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getStatusBadge(need.status)}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceColors[need.source] || 'bg-slate-100 text-slate-700'}`}>
                        {need.source}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{need.need_description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <UsersIcon size={14} />
                        {need.participant_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MailIcon size={14} />
                        {need.participant_email}
                      </span>
                      <span>Identified: {need.date_identified ? new Date(need.date_identified).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-sm font-medium whitespace-nowrap">
                  Create Plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNeeds.length === 0 && (
          <div className="text-center py-12">
            <TargetIcon size={40} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-lg font-medium text-slate-800">No training needs found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Add Training Need</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Participant</label>
                <select
                  value={formData.participantId}
                  onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select participant</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.organization}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Need Description</label>
                <textarea
                  value={formData.needDescription}
                  onChange={(e) => setFormData({ ...formData, needDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Describe the training need..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as TrainingSource })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="FCP Selected Interventions from FPP">FCP Selected Interventions from FPP</option>
                  <option value="GMC/Regional Training Needs">GMC/Regional Training Needs</option>
                  <option value="National Office Mandatory Trainings">National Office Mandatory Trainings</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNeed}
                disabled={!formData.participantId || !formData.needDescription}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Need
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingNeeds;
