import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/database';
import type { DbParticipantRegistration } from '@/lib/database';
import {
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  VideoIcon,
  BuildingIcon,
  EyeIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LinkIcon,
} from '@/components/icons/Icons';
import RegistrationLinkGenerator from './RegistrationLinkGenerator';
import ParticipantRegistrationList from './ParticipantRegistrationList';

const TrainingSessions: React.FC = () => {
  const { trainingSessions, trainingPlans, participants, facilities, addTrainingSession, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<typeof trainingSessions[0] | null>(null);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [showRegistrationList, setShowRegistrationList] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    trainingPlanId: '',
    facilityId: '',
    date: '',
    format: 'In-Person' as 'In-Person' | 'Virtual',
    participants: [] as string[],
    topics: ['Introduction', 'Topic A', 'Topic B', 'Conclusion'],
  });

  const approvedPlans = trainingPlans.filter(p => p.status === 'approved');

  // Load registration counts for all sessions
  useEffect(() => {
    loadRegistrationCounts();
  }, [trainingSessions]);

  const loadRegistrationCounts = async () => {
    const counts: Record<string, number> = {};
    for (const session of trainingSessions) {
      try {
        const registrations = await db.getRegistrationsBySessionId(session.id);
        counts[session.id] = registrations.length;
      } catch (error) {
        console.error(`Failed to load registrations for session ${session.id}:`, error);
        counts[session.id] = 0;
      }
    }
    setRegistrationCounts(counts);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.scheduled}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const handleCreateSession = async () => {
    const plan = trainingPlans.find(p => p.id === formData.trainingPlanId);
    const facility = facilities.find(f => f.id === formData.facilityId);
    
    if (!plan || !facility) return;

    try {
      await addTrainingSession({
        training_plan_id: formData.trainingPlanId,
        training_name: `${plan.title} - Session`,
        facility_id: formData.facilityId,
        facility_name: facility.name,
        session_date: formData.date,
        format: formData.format,
        participants: formData.participants,
        facilitator_id: currentUser?.id || '',
        facilitator_name: currentUser?.name || '',
        topics: formData.topics,
        status: 'scheduled',
      });
      setShowCreateModal(false);
      setFormData({
        trainingPlanId: '',
        facilityId: '',
        date: '',
        format: 'In-Person',
        participants: [],
        topics: ['Introduction', 'Topic A', 'Topic B', 'Conclusion'],
      });
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  // Check for facility conflicts
  const checkFacilityConflict = (facilityId: string, date: string) => {
    return trainingSessions.some(s => 
      s.facility_id === facilityId && 
      s.session_date === date && 
      s.status !== 'cancelled'
    );
  };

  const upcomingSessions = trainingSessions
    .filter(s => new Date(s.session_date) >= new Date() && s.status === 'scheduled')
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

  const pastSessions = trainingSessions
    .filter(s => new Date(s.session_date) < new Date() || s.status === 'completed')
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Training Sessions</h1>
          <p className="text-slate-500 mt-1">Schedule and manage training sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
          >
            <PlusIcon size={20} />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Sessions</span>
            <span className="text-2xl font-bold text-slate-800">{trainingSessions.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Upcoming</span>
            <span className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Completed</span>
            <span className="text-2xl font-bold text-emerald-600">{pastSessions.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">This Month</span>
            <span className="text-2xl font-bold text-purple-600">
              {trainingSessions.filter(s => {
                const d = new Date(s.session_date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-500" />
                Upcoming Sessions ({upcomingSessions.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                          {new Date(session.session_date).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(session.status)}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            session.format === 'In-Person' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {session.format}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800">{session.training_name}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            {session.format === 'In-Person' ? <BuildingIcon size={14} /> : <VideoIcon size={14} />}
                            {session.facility_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersIcon size={14} />
                            {session.participants.length} participants
                          </span>
                          {registrationCounts[session.id] > 0 && (
                            <span className="flex items-center gap-1 text-teal-600 font-medium">
                              <CheckCircleIcon size={14} />
                              {registrationCounts[session.id]} registered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {registrationCounts[session.id] > 0 && (
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setShowRegistrationList(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors"
                        >
                          <UsersIcon size={18} />
                          View Registrations
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <EyeIcon size={18} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <CalendarIcon size={40} className="mx-auto text-slate-300 mb-2" />
                  <p>No upcoming sessions scheduled</p>
                </div>
              )}
            </div>
          </div>

          {/* Past Sessions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircleIcon size={20} className="text-emerald-500" />
                Past Sessions ({pastSessions.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {pastSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-slate-600">
                          {new Date(session.session_date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700">{session.training_name}</h4>
                        <p className="text-sm text-slate-500">{session.facility_name}</p>
                      </div>
                    </div>
                    {getStatusBadge('completed')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="text-center py-12 text-slate-500">
            <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Calendar View</h3>
            <p className="mt-2">Full calendar integration coming soon</p>
            <p className="text-sm mt-1">Use list view to see all scheduled sessions</p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-800">Schedule Session</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Plan</label>
                <select
                  value={formData.trainingPlanId}
                  onChange={(e) => setFormData({ ...formData, trainingPlanId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select approved plan</option>
                  {approvedPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Format</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: 'In-Person' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                      formData.format === 'In-Person'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <BuildingIcon size={20} />
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: 'Virtual' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                      formData.format === 'Virtual'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <VideoIcon size={20} />
                    Virtual
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Facility</label>
                <select
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select facility</option>
                  {facilities
                    .filter(f => formData.format === 'Virtual' ? f.type === 'Online Platform' : f.type === 'Hotel Facility')
                    .map(facility => {
                      const hasConflict = formData.date && checkFacilityConflict(facility.id, formData.date);
                      return (
                        <option key={facility.id} value={facility.id} disabled={!!hasConflict}>
                          {facility.name} (Cap: {facility.capacity}) {hasConflict ? '- BOOKED' : ''}
                        </option>
                      );
                    })}
                </select>
                {formData.facilityId && formData.date && checkFacilityConflict(formData.facilityId, formData.date) && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircleIcon size={14} />
                    This facility is already booked for the selected date
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Participants</label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                  {participants.map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, participants: [...formData.participants, p.id] });
                          } else {
                            setFormData({ ...formData, participants: formData.participants.filter(id => id !== p.id) });
                          }
                        }}
                        className="rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-700">{p.name}</span>
                      <span className="text-xs text-slate-400">({p.organization})</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">{formData.participants.length} participants selected</p>
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
                onClick={handleCreateSession}
                disabled={!formData.trainingPlanId || !formData.date || !formData.facilityId}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && !showRegistrationList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-800">Session Details</h2>
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setShowLinkGenerator(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{selectedSession.training_name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedSession.status)}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedSession.format === 'In-Person' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedSession.format}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <CalendarIcon size={14} /> Date
                  </p>
                  <p className="font-medium text-slate-800 mt-1">
                    {new Date(selectedSession.session_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <BuildingIcon size={14} /> Facility
                  </p>
                  <p className="font-medium text-slate-800 mt-1">{selectedSession.facility_name}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                  <UsersIcon size={14} /> Participants ({selectedSession.participants.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.participants.map(pId => {
                    const p = participants.find(part => part.id === pId);
                    return p ? (
                      <span key={pId} className="px-2 py-1 bg-white rounded-lg text-sm text-slate-700">
                        {p.name}
                      </span>
                    ) : null;
                  })}
                </div>
                {registrationCounts[selectedSession.id] > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowRegistrationList(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <UsersIcon size={16} />
                      View {registrationCounts[selectedSession.id]} Self-Registered Participants
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-2">Topics</p>
                <ul className="space-y-1">
                  {selectedSession.topics.map((topic, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Registration Link Section */}
              {selectedSession.status === 'scheduled' && (
                <div className="border-t border-slate-100 pt-4">
                  {!showLinkGenerator ? (
                    <button
                      onClick={() => setShowLinkGenerator(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
                    >
                      <LinkIcon size={20} />
                      Generate Registration Link
                    </button>
                  ) : (
                    <RegistrationLinkGenerator
                      trainingSessionId={selectedSession.id}
                      currentUserId={currentUser?.id || ''}
                      onClose={() => setShowLinkGenerator(false)}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setShowLinkGenerator(false);
                }}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Registration List Modal */}
      {showRegistrationList && selectedSession && (
        <ParticipantRegistrationList
          trainingSessionId={selectedSession.id}
          onClose={() => {
            setShowRegistrationList(false);
            setSelectedSession(null);
            loadRegistrationCounts(); // Refresh counts after viewing
          }}
        />
      )}
    </div>
  );
};

export default TrainingSessions;
