import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db, DbSurveySchedule, DbSurveyTemplate, DbSurveyResponse, DbSurveyQuestion } from '@/lib/database';
import { PlusIcon, XIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from '@/components/icons/Icons';

const followUpLabels: Record<string, string> = {
  immediate: 'Immediate',
  '1_month': '1 Month',
  '3_months': '3 Months',
  '6_months': '6 Months',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
};

const ScheduledAssessments: React.FC = () => {
  const { trainingPlans, users, participants, currentUser, isOnline } = useApp();
  const [schedules, setSchedules] = useState<DbSurveySchedule[]>([]);
  const [templates, setTemplates] = useState<DbSurveyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DbSurveySchedule | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Create form
  const [formTemplateId, setFormTemplateId] = useState('');
  const [formPlanId, setFormPlanId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formType, setFormType] = useState<DbSurveySchedule['follow_up_type']>('3_months');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Response form
  const [questions, setQuestions] = useState<DbSurveyQuestion[]>([]);
  const [responseParticipant, setResponseParticipant] = useState('');
  const [responseAnswers, setResponseAnswers] = useState<Record<string, any>>({});
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sched, tmpl] = await Promise.all([
        db.getSurveySchedules(),
        db.getSurveyTemplates(),
      ]);
      setSchedules(sched);
      setTemplates(tmpl);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateName = (id: string) => templates.find(t => t.id === id)?.title || 'Unknown Survey';
  const getPlanTitle = (id: string) => trainingPlans.find(p => p.id === id)?.title || 'Unknown Training';
  const getAssigneeName = (id: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  const handleCreateSchedule = async () => {
    if (!formTemplateId || !formPlanId || !formDate) return;
    setSaving(true);
    try {
      const created = await db.createSurveySchedule({
        survey_template_id: formTemplateId,
        training_plan_id: formPlanId,
        scheduled_date: formDate,
        follow_up_type: formType,
        status: 'pending',
        assigned_to: formAssignedTo,
        notes: formNotes,
      });
      setSchedules(prev => [...prev, created]);
      setShowCreateModal(false);
      setFormTemplateId(''); setFormPlanId(''); setFormDate(''); setFormType('3_months'); setFormAssignedTo(''); setFormNotes('');
    } catch (err) {
      console.error('Failed to create schedule:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (schedule: DbSurveySchedule, newStatus: DbSurveySchedule['status']) => {
    try {
      const updates: Partial<DbSurveySchedule> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      const updated = await db.updateSurveySchedule(schedule.id, updates);
      setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err) {
      console.error('Failed to update schedule:', err);
    }
  };

  const openResponseForm = async (schedule: DbSurveySchedule) => {
    setSelectedSchedule(schedule);
    try {
      const qs = await db.getSurveyQuestions(schedule.survey_template_id);
      setQuestions(qs);
      setResponseAnswers({});
      setResponseParticipant('');
      setShowResponseModal(true);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedSchedule || !responseParticipant) return;
    setSubmittingResponse(true);
    try {
      const participant = participants.find(p => p.id === responseParticipant);
      let totalScore = 0;
      let maxScore = 0;
      questions.forEach(q => {
        const answer = responseAnswers[q.id];
        if (q.question_type === 'scale_1_10' && typeof answer === 'number') {
          totalScore += answer;
          maxScore += 10;
        } else if (q.question_type === 'rating' && typeof answer === 'number') {
          totalScore += answer;
          maxScore += 5;
        } else if (q.question_type === 'yes_no') {
          totalScore += answer === 'Yes' ? 1 : 0;
          maxScore += 1;
        }
      });

      await db.createSurveyResponse({
        survey_template_id: selectedSchedule.survey_template_id,
        survey_schedule_id: selectedSchedule.id,
        participant_id: responseParticipant,
        participant_name: participant?.name || '',
        training_plan_id: selectedSchedule.training_plan_id,
        responses: responseAnswers,
        total_score: totalScore,
        max_possible_score: maxScore,
        synced: isOnline,
      });

      setShowResponseModal(false);
      setSelectedSchedule(null);
      // Update status to in_progress if pending
      if (selectedSchedule.status === 'pending') {
        await handleStatusChange(selectedSchedule, 'in_progress');
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const isOverdue = (schedule: DbSurveySchedule) => {
    return schedule.status === 'pending' && new Date(schedule.scheduled_date) < new Date();
  };

  const filteredSchedules = schedules.filter(s => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') return isOverdue(s);
    return s.status === filterStatus;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => 
    new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Scheduled Assessments</h3>
          <p className="text-sm text-slate-500">
            {schedules.filter(s => s.status === 'pending').length} pending &middot; {schedules.filter(s => s.status === 'completed').length} completed
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
        >
          <PlusIcon size={18} />
          <span className="text-sm font-medium">Schedule Assessment</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'in_progress', 'completed', 'overdue'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-teal-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      {sortedSchedules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <CalendarIcon size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No scheduled assessments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSchedules.map(schedule => {
            const overdue = isOverdue(schedule);
            const displayStatus = overdue ? 'overdue' : schedule.status;
            return (
              <div key={schedule.id} className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-all ${overdue ? 'border-red-200' : 'border-slate-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 truncate">{getTemplateName(schedule.survey_template_id)}</h4>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusColors[displayStatus] || 'bg-slate-100 text-slate-600'}`}>
                        {displayStatus === 'in_progress' ? 'In Progress' : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{getPlanTitle(schedule.training_plan_id)}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon size={14} />
                        {followUpLabels[schedule.follow_up_type] || schedule.follow_up_type}
                      </span>
                      <span>Assigned: {getAssigneeName(schedule.assigned_to)}</span>
                    </div>
                    {schedule.notes && (
                      <p className="text-xs text-slate-400 mt-1 italic">{schedule.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {schedule.status !== 'completed' && (
                      <button
                        onClick={() => openResponseForm(schedule)}
                        className="px-3 py-2 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                      >
                        Record Response
                      </button>
                    )}
                    {schedule.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(schedule, 'completed')}
                        className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    {schedule.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(schedule, 'in_progress')}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Schedule Follow-Up Assessment</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Training Plan *</label>
                <select value={formPlanId} onChange={e => setFormPlanId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                  <option value="">Select training...</option>
                  {trainingPlans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Survey Template *</label>
                <select value={formTemplateId} onChange={e => setFormTemplateId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                  <option value="">Select survey...</option>
                  {templates.filter(t => !formPlanId || t.training_plan_id === formPlanId).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date *</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Follow-Up Type</label>
                  <select value={formType} onChange={e => setFormType(e.target.value as DbSurveySchedule['follow_up_type'])}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                    <option value="immediate">Immediate</option>
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                <select value={formAssignedTo} onChange={e => setFormAssignedTo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                  <option value="">Select staff...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2}
                  placeholder="Optional notes..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleCreateSchedule} disabled={!formTemplateId || !formPlanId || !formDate || saving}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50">
                {saving ? 'Scheduling...' : 'Schedule Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Response Modal */}
      {showResponseModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Record Survey Response</h3>
                <p className="text-sm text-slate-500">{getTemplateName(selectedSchedule.survey_template_id)}</p>
              </div>
              <button onClick={() => setShowResponseModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Participant *</label>
                <select value={responseParticipant} onChange={e => setResponseParticipant(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                  <option value="">Select participant...</option>
                  {participants.map(p => <option key={p.id} value={p.id}>{p.name} - {p.organization}</option>)}
                </select>
              </div>

              {questions.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No questions in this survey</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                        <p className="text-sm font-medium text-slate-700">
                          {q.question_text}
                          {q.is_required && <span className="text-red-400 ml-1">*</span>}
                        </p>
                      </div>
                      {q.question_type === 'scale_1_10' && (
                        <div className="flex gap-1 flex-wrap ml-8">
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <button key={n} onClick={() => setResponseAnswers(prev => ({...prev, [q.id]: n}))}
                              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                responseAnswers[q.id] === n
                                  ? 'bg-teal-500 text-white shadow-sm'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                              }`}>
                              {n}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'rating' && (
                        <div className="flex gap-1 ml-8">
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setResponseAnswers(prev => ({...prev, [q.id]: n}))}
                              className={`w-10 h-10 rounded-lg transition-all ${
                                responseAnswers[q.id] >= n
                                  ? 'text-amber-400'
                                  : 'text-slate-300'
                              }`}>
                              <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'yes_no' && (
                        <div className="flex gap-2 ml-8">
                          {['Yes', 'No'].map(opt => (
                            <button key={opt} onClick={() => setResponseAnswers(prev => ({...prev, [q.id]: opt}))}
                              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                responseAnswers[q.id] === opt
                                  ? opt === 'Yes' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'multiple_choice' && Array.isArray(q.options) && (
                        <div className="space-y-1.5 ml-8">
                          {q.options.map((opt, i) => (
                            <button key={i} onClick={() => setResponseAnswers(prev => ({...prev, [q.id]: String(opt)}))}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                                responseAnswers[q.id] === String(opt)
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                              }`}>
                              {String(opt)}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'text' && (
                        <textarea
                          value={responseAnswers[q.id] || ''}
                          onChange={e => setResponseAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                          rows={2}
                          placeholder="Type your answer..."
                          className="w-full ml-8 max-w-[calc(100%-2rem)] px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowResponseModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleSubmitResponse} disabled={!responseParticipant || submittingResponse}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50">
                {submittingResponse ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledAssessments;
