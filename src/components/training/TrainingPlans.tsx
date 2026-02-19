import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DbTrainingPlan } from '@/lib/database';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
  XIcon,
} from '@/components/icons/Icons';

type TrainingType = 'In-Person' | 'Virtual/Zoom' | 'Blended' | 'Forchildren.Com';
type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

const regions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
];

const TrainingPlans: React.FC = () => {
  const { trainingPlans, addTrainingPlan, updateTrainingPlan, currentUser, users, isLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DbTrainingPlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    objectives: '',
    methodologies: '',
    team_members: [] as string[],
    start_date: '',
    end_date: '',
    region: '',
    training_type: 'In-Person' as TrainingType,
    participant_count: 0,
  });

  const filteredPlans = trainingPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (plan.objectives || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const staffMembers = users.filter(u => u.role === 'facilitator' || u.role === 'coordinator');

  const getStatusBadge = (status: PlanStatus) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-600',
      submitted: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const icons = {
      draft: <EditIcon size={14} />,
      submitted: <ClockIcon size={14} />,
      approved: <CheckCircleIcon size={14} />,
      rejected: <XCircleIcon size={14} />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleCreatePlan = async () => {
    if (!formData.title || !formData.start_date || !formData.end_date || !formData.region) return;
    
    setIsSubmitting(true);
    try {
      await addTrainingPlan({
        title: formData.title,
        objectives: formData.objectives,
        methodologies: formData.methodologies,
        team_members: formData.team_members,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'draft',
        region: formData.region,
        training_type: formData.training_type,
        participant_count: formData.participant_count,
        created_by: currentUser?.id || '',
        version: 1,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (planId: string) => {
    try {
      await updateTrainingPlan(planId, { status: 'submitted' });
    } catch (err) {
      console.error('Failed to submit plan:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      objectives: '',
      methodologies: '',
      team_members: [],
      start_date: '',
      end_date: '',
      region: '',
      training_type: 'In-Person',
      participant_count: 0,
    });
  };

  const handleViewDetails = (plan: DbTrainingPlan) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading training plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Training Plans</h1>
          <p className="text-slate-500 mt-1">Manage and track all training plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
        >
          <PlusIcon size={20} />
          Create Plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search training plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PlanStatus | 'all')}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                {getStatusBadge(plan.status)}
                <span className="text-xs text-slate-400">v{plan.version}</span>
              </div>
              <h3 className="font-semibold text-slate-800 text-lg mb-2 line-clamp-2">{plan.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{plan.objectives}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarIcon size={16} className="text-slate-400" />
                  <span>{new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPinIcon size={16} className="text-slate-400" />
                  <span>{plan.region}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <UsersIcon size={16} className="text-slate-400" />
                  <span>{plan.participant_count} participants</span>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                plan.training_type === 'In-Person' ? 'bg-emerald-100 text-emerald-700' :
                plan.training_type === 'Virtual/Zoom' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {plan.training_type}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(plan)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  title="View Details"
                >
                  <EyeIcon size={16} className="text-slate-500" />
                </button>
                {plan.status === 'draft' && (
                  <button
                    onClick={() => handleSubmitForApproval(plan.id)}
                    className="px-3 py-1.5 bg-teal-500 text-white text-xs font-medium rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800">No training plans found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-800">Create Training Plan</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter training title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Objectives</label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Describe the training objectives"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Methodologies</label>
                <textarea
                  value={formData.methodologies}
                  onChange={(e) => setFormData({ ...formData, methodologies: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Describe training methodologies"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Region *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select region</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Type</label>
                  <select
                    value={formData.training_type}
                    onChange={(e) => setFormData({ ...formData, training_type: e.target.value as TrainingType })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Virtual/Zoom">Virtual/Zoom</option>
                    <option value="Blended">Blended</option>
                    <option value="Forchildren.Com">Forchildren.Com</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Participants</label>
                <input
                  type="number"
                  value={formData.participant_count}
                  onChange={(e) => setFormData({ ...formData, participant_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Number of participants"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Members</label>
                <div className="flex flex-wrap gap-2">
                  {staffMembers.map(staff => (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => {
                        const isSelected = formData.team_members.includes(staff.id);
                        setFormData({
                          ...formData,
                          team_members: isSelected
                            ? formData.team_members.filter(id => id !== staff.id)
                            : [...formData.team_members, staff.id]
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.team_members.includes(staff.id)
                          ? 'bg-teal-100 text-teal-700 border-2 border-teal-500'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {staff.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={!formData.title || !formData.start_date || !formData.end_date || !formData.region || isSubmitting}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{selectedPlan.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedPlan.status)}
                  <span className="text-sm text-slate-400">Version {selectedPlan.version}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Objectives</h4>
                <p className="text-slate-700">{selectedPlan.objectives || 'No objectives specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Methodologies</h4>
                <p className="text-slate-700">{selectedPlan.methodologies || 'No methodologies specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Duration</h4>
                  <p className="text-slate-700">{new Date(selectedPlan.start_date).toLocaleDateString()} - {new Date(selectedPlan.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Training Type</h4>
                  <p className="text-slate-700">{selectedPlan.training_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Region</h4>
                  <p className="text-slate-700">{selectedPlan.region}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Participants</h4>
                  <p className="text-slate-700">{selectedPlan.participant_count}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Team Members</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedPlan.team_members || []).map(memberId => (
                    <span key={memberId} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                      {getUserName(memberId)}
                    </span>
                  ))}
                  {(!selectedPlan.team_members || selectedPlan.team_members.length === 0) && (
                    <span className="text-slate-400 text-sm">No team members assigned</span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {selectedPlan.status === 'draft' && (
                <button
                  onClick={() => {
                    handleSubmitForApproval(selectedPlan.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
                >
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPlans;
