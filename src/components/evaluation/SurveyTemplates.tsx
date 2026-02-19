import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db, DbSurveyTemplate, DbSurveyQuestion } from '@/lib/database';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, EyeIcon, XIcon, CheckIcon } from '@/components/icons/Icons';

interface SurveyTemplatesProps {
  onViewQuestions: (template: DbSurveyTemplate) => void;
}

const surveyTypeLabels: Record<string, string> = {
  pre_training: 'Pre-Training',
  post_training: 'Post-Training',
  follow_up_3m: '3-Month Follow-Up',
  follow_up_6m: '6-Month Follow-Up',
};

const surveyTypeColors: Record<string, string> = {
  pre_training: 'bg-blue-100 text-blue-700',
  post_training: 'bg-green-100 text-green-700',
  follow_up_3m: 'bg-amber-100 text-amber-700',
  follow_up_6m: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-gray-100 text-gray-500',
};

const SurveyTemplates: React.FC<SurveyTemplatesProps> = ({ onViewQuestions }) => {
  const { trainingPlans, currentUser } = useApp();
  const [templates, setTemplates] = useState<DbSurveyTemplate[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DbSurveyTemplate | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<DbSurveyTemplate['survey_type']>('post_training');
  const [formPlanId, setFormPlanId] = useState('');
  const [formStatus, setFormStatus] = useState<DbSurveyTemplate['status']>('draft');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await db.getSurveyTemplates();
      setTemplates(data);
      // Load question counts
      const allQuestions = await db.getSurveyQuestions();
      const counts: Record<string, number> = {};
      allQuestions.forEach(q => {
        counts[q.survey_template_id] = (counts[q.survey_template_id] || 0) + 1;
      });
      setQuestionCounts(counts);
    } catch (err) {
      console.error('Failed to load survey templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormType('post_training');
    setFormPlanId('');
    setFormStatus('draft');
    setEditingTemplate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (template: DbSurveyTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormDescription(template.description);
    setFormType(template.survey_type);
    setFormPlanId(template.training_plan_id);
    setFormStatus(template.status);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formPlanId) return;
    setSaving(true);
    try {
      if (editingTemplate) {
        const updated = await db.updateSurveyTemplate(editingTemplate.id, {
          title: formTitle,
          description: formDescription,
          survey_type: formType,
          training_plan_id: formPlanId,
          status: formStatus,
        });
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await db.createSurveyTemplate({
          title: formTitle,
          description: formDescription,
          survey_type: formType,
          training_plan_id: formPlanId,
          status: formStatus,
          created_by: currentUser?.id || '',
        });
        setTemplates(prev => [created, ...prev]);
      }
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this survey template and all its questions?')) return;
    try {
      await db.deleteSurveyTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const handleActivate = async (template: DbSurveyTemplate) => {
    const newStatus = template.status === 'active' ? 'draft' : 'active';
    try {
      const updated = await db.updateSurveyTemplate(template.id, { status: newStatus });
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error('Failed to update template status:', err);
    }
  };

  const getPlanTitle = (planId: string) => {
    const plan = trainingPlans.find(p => p.id === planId);
    return plan?.title || 'Unknown Training';
  };

  const filtered = templates.filter(t => {
    const matchSearch = (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.survey_type === filterType;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

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
          <h3 className="text-lg font-semibold text-slate-800">Survey Templates</h3>
          <p className="text-sm text-slate-500">{templates.length} templates created</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
        >
          <PlusIcon size={18} />
          <span className="text-sm font-medium">New Survey</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search surveys..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="all">All Types</option>
          <option value="pre_training">Pre-Training</option>
          <option value="post_training">Post-Training</option>
          <option value="follow_up_3m">3-Month Follow-Up</option>
          <option value="follow_up_6m">6-Month Follow-Up</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-500">No survey templates found</p>
          <button onClick={openCreateModal} className="mt-3 text-teal-600 text-sm font-medium hover:text-teal-700">
            Create your first survey
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${surveyTypeColors[template.survey_type] || 'bg-slate-100 text-slate-600'}`}>
                    {surveyTypeLabels[template.survey_type] || template.survey_type}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[template.status] || 'bg-slate-100 text-slate-600'}`}>
                    {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                  </span>
                </div>
              </div>
              <h4 className="font-semibold text-slate-800 mb-1 line-clamp-2">{template.title}</h4>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{template.description || 'No description'}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="truncate">{getPlanTitle(template.training_plan_id)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {questionCounts[template.id] || 0} questions
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewQuestions(template)}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="View / Edit Questions"
                  >
                    <EyeIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleActivate(template)}
                    className={`p-2 rounded-lg transition-colors ${template.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                    title={template.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <CheckIcon size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(template)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingTemplate ? 'Edit Survey Template' : 'Create Survey Template'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Survey Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g., Post-Training Knowledge Assessment"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the purpose of this survey..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Associated Training *</label>
                <select
                  value={formPlanId}
                  onChange={e => setFormPlanId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">Select a training plan...</option>
                  {trainingPlans.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Survey Type *</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as DbSurveyTemplate['survey_type'])}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="pre_training">Pre-Training</option>
                    <option value="post_training">Post-Training</option>
                    <option value="follow_up_3m">3-Month Follow-Up</option>
                    <option value="follow_up_6m">6-Month Follow-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as DbSurveyTemplate['status'])}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formTitle.trim() || !formPlanId || saving}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingTemplate ? 'Update Survey' : 'Create Survey'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyTemplates;
