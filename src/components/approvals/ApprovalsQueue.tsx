import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DbTrainingPlan, DbTrainingMaterial } from '@/lib/database';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrainingIcon,
  FolderIcon,
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
  XIcon,
  FilterIcon,
} from '@/components/icons/Icons';

type ApprovalItem = {
  type: 'plan' | 'material';
  data: DbTrainingPlan | DbTrainingMaterial;
};

const ApprovalsQueue: React.FC = () => {
  const { trainingPlans, trainingMaterials, updateTrainingPlan, updateTrainingMaterial, users } = useApp();
  const [filter, setFilter] = useState<'all' | 'plans' | 'materials'>('all');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const pendingPlans = trainingPlans.filter(p => p.status === 'submitted');
  const pendingMaterials = trainingMaterials.filter(m => m.status === 'submitted');

  const allPendingItems: ApprovalItem[] = [
    ...pendingPlans.map(p => ({ type: 'plan' as const, data: p })),
    ...pendingMaterials.map(m => ({ type: 'material' as const, data: m })),
  ];

  const filteredItems = allPendingItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'plans') return item.type === 'plan';
    if (filter === 'materials') return item.type === 'material';
    return true;
  });

  const handleApprove = async (item: ApprovalItem) => {
    try {
      if (item.type === 'plan') {
        await updateTrainingPlan(item.data.id, { status: 'approved' });
      } else {
        await updateTrainingMaterial(item.data.id, { status: 'approved' });
      }
      setShowDetailModal(false);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    try {
      if (item.type === 'plan') {
        await updateTrainingPlan(item.data.id, { status: 'rejected' });
      } else {
        await updateTrainingMaterial(item.data.id, { status: 'rejected' });
      }
      setShowDetailModal(false);
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const viewDetails = (item: ApprovalItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const getSubmitterName = (id: string) => {
    const staff = users.find(s => s.id === id);
    return staff?.name || 'Unknown';
  };

  const getPlanTitle = (planId: string) => {
    const plan = trainingPlans.find(p => p.id === planId);
    return plan?.title || 'Unknown Plan';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Approvals Queue</h1>
          <p className="text-slate-500 mt-1">Review and approve training plans and materials</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl">
          <ClockIcon size={20} />
          <span className="font-semibold">{allPendingItems.length} pending approvals</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-600 font-medium">Training Plans</p>
              <p className="text-3xl font-bold text-teal-700 mt-1">{pendingPlans.length}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <TrainingIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Materials</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{pendingMaterials.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <FolderIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Total Pending</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{allPendingItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <ClockIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <FilterIcon size={18} className="text-slate-400" />
        <div className="flex bg-slate-100 rounded-xl p-1">
          {(['all', 'plans', 'materials'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All Items' : f === 'plans' ? 'Training Plans' : 'Materials'}
            </button>
          ))}
        </div>
      </div>

      {/* Approval Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={`${item.type}-${item.data.id}`}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.type === 'plan' 
                      ? 'bg-gradient-to-br from-teal-100 to-emerald-100' 
                      : 'bg-gradient-to-br from-purple-100 to-violet-100'
                  }`}>
                    {item.type === 'plan' 
                      ? <TrainingIcon size={24} className="text-teal-600" />
                      : <FolderIcon size={24} className="text-purple-600" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.type === 'plan' 
                          ? 'bg-teal-100 text-teal-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type === 'plan' ? 'Training Plan' : 'Material'}
                      </span>
                      <span className="text-xs text-slate-400">
                        v{item.data.version}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg">
                      {item.data.title}
                    </h3>
                    {item.type === 'plan' && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon size={14} />
                          {new Date((item.data as DbTrainingPlan).start_date).toLocaleDateString()} - {new Date((item.data as DbTrainingPlan).end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon size={14} />
                          {(item.data as DbTrainingPlan).region}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon size={14} />
                          {(item.data as DbTrainingPlan).participant_count} participants
                        </span>
                      </div>
                    )}
                    {item.type === 'material' && (
                      <p className="text-sm text-slate-500 mt-1">
                        For: {getPlanTitle((item.data as DbTrainingMaterial).training_plan_id)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Submitted by {getSubmitterName(item.type === 'plan' 
                        ? (item.data as DbTrainingPlan).created_by 
                        : (item.data as DbTrainingMaterial).uploaded_by
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewDetails(item)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <EyeIcon size={18} />
                    Review
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <XCircleIcon size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-lg shadow-emerald-500/25"
                  >
                    <CheckCircleIcon size={18} />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">All caught up!</h3>
          <p className="text-slate-500 mt-2">No pending approvals at the moment</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  selectedItem.type === 'plan' 
                    ? 'bg-teal-100 text-teal-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedItem.type === 'plan' ? 'Training Plan' : 'Material'}
                </span>
                <h2 className="text-xl font-semibold text-slate-800 mt-2">
                  {selectedItem.data.title}
                </h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedItem.type === 'plan' && (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Objectives</h4>
                    <p className="text-slate-700">{(selectedItem.data as DbTrainingPlan).objectives}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Methodologies</h4>
                    <p className="text-slate-700">{(selectedItem.data as DbTrainingPlan).methodologies}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Duration</h4>
                      <p className="text-slate-700">
                        {new Date((selectedItem.data as DbTrainingPlan).start_date).toLocaleDateString()} - {new Date((selectedItem.data as DbTrainingPlan).end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Training Type</h4>
                      <p className="text-slate-700">{(selectedItem.data as DbTrainingPlan).training_type}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Region</h4>
                      <p className="text-slate-700">{(selectedItem.data as DbTrainingPlan).region}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Participants</h4>
                      <p className="text-slate-700">{(selectedItem.data as DbTrainingPlan).participant_count}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Team Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {((selectedItem.data as DbTrainingPlan).team_members || []).map(memberId => {
                        const member = users.find(s => s.id === memberId);
                        return member ? (
                          <span key={memberId} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                            {member.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </>
              )}
              
              {selectedItem.type === 'material' && (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Associated Training Plan</h4>
                    <p className="text-slate-700">{getPlanTitle((selectedItem.data as DbTrainingMaterial).training_plan_id)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Format</h4>
                      <p className="text-slate-700">{(selectedItem.data as DbTrainingMaterial).format}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">File Size</h4>
                      <p className="text-slate-700">{(selectedItem.data as DbTrainingMaterial).file_size}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedItem)}
                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <XCircleIcon size={18} />
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedItem)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center gap-2"
              >
                <CheckCircleIcon size={18} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsQueue;
