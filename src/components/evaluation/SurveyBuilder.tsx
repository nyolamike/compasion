import React, { useState, useEffect } from 'react';
import { db, DbSurveyTemplate, DbSurveyQuestion } from '@/lib/database';
import { PlusIcon, TrashIcon, XIcon, ChevronDownIcon } from '@/components/icons/Icons';

interface SurveyBuilderProps {
  template: DbSurveyTemplate;
  onBack: () => void;
}

const questionTypeLabels: Record<string, string> = {
  rating: 'Star Rating (1-5)',
  text: 'Open Text',
  multiple_choice: 'Multiple Choice',
  yes_no: 'Yes / No',
  scale_1_10: 'Scale (1-10)',
};

const questionTypeIcons: Record<string, string> = {
  rating: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  text: 'M4 6h16M4 12h16M4 18h7',
  multiple_choice: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  yes_no: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  scale_1_10: 'M4 20h16M4 20V10m0 10l4-8m12 8V4m0 16l-4-12',
};

const categoryOptions = ['Knowledge', 'Confidence', 'Application', 'Satisfaction', 'Experience', 'Feedback', 'Impact', 'General'];

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ template, onBack }) => {
  const [questions, setQuestions] = useState<DbSurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DbSurveyQuestion | null>(null);

  // Form state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<DbSurveyQuestion['question_type']>('scale_1_10');
  const [qCategory, setQCategory] = useState('General');
  const [qRequired, setQRequired] = useState(true);
  const [qOptions, setQOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [template.id]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await db.getSurveyQuestions(template.id);
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQText('');
    setQType('scale_1_10');
    setQCategory('General');
    setQRequired(true);
    setQOptions([]);
    setNewOption('');
    setEditingQuestion(null);
  };

  const openEdit = (q: DbSurveyQuestion) => {
    setEditingQuestion(q);
    setQText(q.question_text);
    setQType(q.question_type);
    setQCategory(q.category);
    setQRequired(q.is_required);
    setQOptions(Array.isArray(q.options) ? q.options : []);
    setShowAddForm(true);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setQOptions(prev => [...prev, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (idx: number) => {
    setQOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!qText.trim()) return;
    setSaving(true);
    try {
      if (editingQuestion) {
        const updated = await db.updateSurveyQuestion(editingQuestion.id, {
          question_text: qText,
          question_type: qType,
          category: qCategory,
          is_required: qRequired,
          options: qType === 'multiple_choice' ? qOptions : [],
        });
        setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
      } else {
        const created = await db.createSurveyQuestion({
          survey_template_id: template.id,
          question_text: qText,
          question_type: qType,
          category: qCategory,
          is_required: qRequired,
          options: qType === 'multiple_choice' ? qOptions : [],
          sort_order: questions.length + 1,
        });
        setQuestions(prev => [...prev, created]);
      }
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save question:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await db.deleteSurveyQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const surveyTypeLabel: Record<string, string> = {
    pre_training: 'Pre-Training',
    post_training: 'Post-Training',
    follow_up_3m: '3-Month Follow-Up',
    follow_up_6m: '6-Month Follow-Up',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{template.title}</h3>
          <p className="text-sm text-slate-500">
            {surveyTypeLabel[template.survey_type]} &middot; {questions.length} questions
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
        >
          <PlusIcon size={18} />
          <span className="text-sm font-medium">Add Question</span>
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 mb-2">No questions yet</p>
          <p className="text-sm text-slate-400">Add questions to build your survey</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-teal-600">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-800">{q.question_text}</p>
                    {q.is_required && (
                      <span className="text-red-400 text-xs font-medium">Required</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {questionTypeLabels[q.question_type] || q.question_type}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                      {q.category}
                    </span>
                    {q.question_type === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 0 && (
                      <span className="text-xs text-slate-400">
                        {q.options.length} options
                      </span>
                    )}
                  </div>
                  {q.question_type === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {q.options.map((opt, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                          {String(opt)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(q)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              <button onClick={() => { setShowAddForm(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Text *</label>
                <textarea
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  rows={3}
                  placeholder="Enter your question..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                  <select
                    value={qType}
                    onChange={e => setQType(e.target.value as DbSurveyQuestion['question_type'])}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {Object.entries(questionTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={qCategory}
                    onChange={e => setQCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {qType === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Options</label>
                  <div className="space-y-2 mb-2">
                    {qOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">{opt}</span>
                        <button onClick={() => handleRemoveOption(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <XIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={e => setNewOption(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      placeholder="Add an option..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <button
                      onClick={handleAddOption}
                      disabled={!newOption.trim()}
                      className="px-3 py-2 bg-teal-50 text-teal-600 rounded-xl text-sm font-medium hover:bg-teal-100 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qRequired}
                    onChange={e => setQRequired(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">Required question</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => { setShowAddForm(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!qText.trim() || saving}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBuilder;
