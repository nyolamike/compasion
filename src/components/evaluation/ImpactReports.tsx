import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db, DbSurveyTemplate, DbSurveyResponse, DbSurveyQuestion } from '@/lib/database';
import { ChartIcon, DownloadIcon } from '@/components/icons/Icons';

const surveyTypeLabels: Record<string, string> = {
  pre_training: 'Pre-Training',
  post_training: 'Post-Training',
  follow_up_3m: '3-Month Follow-Up',
  follow_up_6m: '6-Month Follow-Up',
};

const ImpactReports: React.FC = () => {
  const { trainingPlans } = useApp();
  const [templates, setTemplates] = useState<DbSurveyTemplate[]>([]);
  const [responses, setResponses] = useState<DbSurveyResponse[]>([]);
  const [questions, setQuestions] = useState<DbSurveyQuestion[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tmpl, resp, qs] = await Promise.all([
        db.getSurveyTemplates(),
        db.getSurveyResponses(),
        db.getSurveyQuestions(),
      ]);
      setTemplates(tmpl);
      setResponses(resp);
      setQuestions(qs);
      // Auto-select first plan that has responses
      const planIds = [...new Set(resp.map(r => r.training_plan_id))];
      if (planIds.length > 0) setSelectedPlan(planIds[0]);
    } catch (err) {
      console.error('Failed to load impact data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get plans that have survey data
  const plansWithData = trainingPlans.filter(p =>
    responses.some(r => r.training_plan_id === p.id)
  );

  // Get templates for selected plan
  const planTemplates = templates.filter(t => t.training_plan_id === selectedPlan);
  const planResponses = responses.filter(r => r.training_plan_id === selectedPlan);

  // Build pre/post comparison data
  const preTemplate = planTemplates.find(t => t.survey_type === 'pre_training');
  const postTemplate = planTemplates.find(t => t.survey_type === 'post_training');
  const followUp3m = planTemplates.find(t => t.survey_type === 'follow_up_3m');
  const followUp6m = planTemplates.find(t => t.survey_type === 'follow_up_6m');

  const getTemplateResponses = (templateId: string) =>
    planResponses.filter(r => r.survey_template_id === templateId);

  const getAverageScore = (templateId: string) => {
    const resps = getTemplateResponses(templateId);
    if (resps.length === 0) return 0;
    const totalPct = resps.reduce((sum, r) => {
      if (r.max_possible_score === 0) return sum;
      return sum + (r.total_score / r.max_possible_score) * 100;
    }, 0);
    return Math.round(totalPct / resps.length);
  };

  // Per-participant comparison
  const getParticipantComparison = () => {
    if (!preTemplate || !postTemplate) return [];
    const preResps = getTemplateResponses(preTemplate.id);
    const postResps = getTemplateResponses(postTemplate.id);

    const participantIds = [...new Set([...preResps, ...postResps].map(r => r.participant_id))];
    return participantIds.map(pid => {
      const pre = preResps.find(r => r.participant_id === pid);
      const post = postResps.find(r => r.participant_id === pid);
      const prePct = pre && pre.max_possible_score > 0 ? Math.round((pre.total_score / pre.max_possible_score) * 100) : null;
      const postPct = post && post.max_possible_score > 0 ? Math.round((post.total_score / post.max_possible_score) * 100) : null;
      const improvement = prePct !== null && postPct !== null ? postPct - prePct : null;
      return {
        participantId: pid,
        participantName: pre?.participant_name || post?.participant_name || 'Unknown',
        preScore: prePct,
        postScore: postPct,
        improvement,
      };
    });
  };

  const participantComparison = getParticipantComparison();
  const avgImprovement = participantComparison.filter(p => p.improvement !== null).length > 0
    ? Math.round(participantComparison.filter(p => p.improvement !== null).reduce((s, p) => s + (p.improvement || 0), 0) / participantComparison.filter(p => p.improvement !== null).length)
    : 0;

  // Per-category analysis
  const getCategoryAnalysis = () => {
    if (!preTemplate || !postTemplate) return [];
    const preQuestions = questions.filter(q => q.survey_template_id === preTemplate.id && (q.question_type === 'scale_1_10' || q.question_type === 'rating'));
    const postQuestions = questions.filter(q => q.survey_template_id === postTemplate.id && (q.question_type === 'scale_1_10' || q.question_type === 'rating'));

    const categories = [...new Set([...preQuestions, ...postQuestions].map(q => q.category))];
    return categories.map(cat => {
      const preQs = preQuestions.filter(q => q.category === cat);
      const postQs = postQuestions.filter(q => q.category === cat);
      return { category: cat, preQuestionCount: preQs.length, postQuestionCount: postQs.length };
    });
  };

  const handleExport = () => {
    const plan = trainingPlans.find(p => p.id === selectedPlan);
    let csv = 'Participant,Pre-Training Score (%),Post-Training Score (%),Improvement (%)\n';
    participantComparison.forEach(p => {
      csv += `"${p.participantName}",${p.preScore ?? 'N/A'},${p.postScore ?? 'N/A'},${p.improvement !== null ? (p.improvement >= 0 ? '+' : '') + p.improvement : 'N/A'}\n`;
    });
    csv += `\nAverage,,${avgImprovement >= 0 ? '+' : ''}${avgImprovement}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact-report-${plan?.title || 'training'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <h3 className="text-lg font-semibold text-slate-800">Impact Reports</h3>
          <p className="text-sm text-slate-500">Compare pre/post training metrics and track long-term impact</p>
        </div>
        {selectedPlan && participantComparison.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
          >
            <DownloadIcon size={18} />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
        )}
      </div>

      {/* Plan Selector */}
      <div className="mb-6">
        <select
          value={selectedPlan}
          onChange={e => setSelectedPlan(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-w-[300px]"
        >
          <option value="">Select a training plan...</option>
          {plansWithData.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {!selectedPlan ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <ChartIcon size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Select a training plan to view impact reports</p>
          <p className="text-sm text-slate-400 mt-1">Only trainings with survey responses are shown</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Pre-Training', template: preTemplate, color: 'blue' },
              { label: 'Post-Training', template: postTemplate, color: 'green' },
              { label: '3-Month Follow-Up', template: followUp3m, color: 'amber' },
              { label: '6-Month Follow-Up', template: followUp6m, color: 'purple' },
            ].map(({ label, template: tmpl, color }) => {
              const resps = tmpl ? getTemplateResponses(tmpl.id) : [];
              const avg = tmpl ? getAverageScore(tmpl.id) : 0;
              const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
                green: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
                amber: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
                purple: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
              };
              const c = colorMap[color];
              return (
                <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                  {tmpl ? (
                    <>
                      <p className={`text-2xl font-bold ${c.text}`}>{avg}%</p>
                      <p className="text-xs text-slate-400 mt-1">{resps.length} responses</p>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                        <div className={`${c.bar} h-2 rounded-full transition-all duration-500`} style={{ width: `${avg}%` }} />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">No survey configured</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Improvement Summary */}
          {preTemplate && postTemplate && participantComparison.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800">Knowledge Improvement Summary</h4>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${avgImprovement >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {avgImprovement >= 0 ? '+' : ''}{avgImprovement}% avg improvement
                </div>
              </div>

              {/* Visual Bar Chart */}
              <div className="space-y-3">
                {participantComparison.map(p => (
                  <div key={p.participantId} className="flex items-center gap-4">
                    <div className="w-36 text-sm text-slate-600 truncate flex-shrink-0">{p.participantName}</div>
                    <div className="flex-1 flex items-center gap-2">
                      {/* Pre bar */}
                      <div className="flex-1 relative">
                        <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="bg-blue-400 h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${p.preScore || 0}%` }}
                          >
                            {(p.preScore || 0) > 15 && (
                              <span className="text-[10px] font-bold text-white">{p.preScore}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Post bar */}
                      <div className="flex-1 relative">
                        <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${p.postScore || 0}%` }}
                          >
                            {(p.postScore || 0) > 15 && (
                              <span className="text-[10px] font-bold text-white">{p.postScore}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Improvement */}
                      <div className={`w-16 text-right text-sm font-bold flex-shrink-0 ${
                        p.improvement !== null && p.improvement >= 0 ? 'text-emerald-600' : p.improvement !== null ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {p.improvement !== null ? `${p.improvement >= 0 ? '+' : ''}${p.improvement}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full" />
                  <span className="text-xs text-slate-500">Pre-Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-xs text-slate-500">Post-Training</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Participant Table */}
          {participantComparison.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h4 className="font-semibold text-slate-800">Detailed Participant Scores</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Participant</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pre-Training</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Post-Training</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participantComparison.map(p => (
                      <tr key={p.participantId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{p.participantName}</td>
                        <td className="px-5 py-3.5 text-center">
                          {p.preScore !== null ? (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">{p.preScore}%</span>
                          ) : (
                            <span className="text-slate-400 text-sm">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {p.postScore !== null ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{p.postScore}%</span>
                          ) : (
                            <span className="text-slate-400 text-sm">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {p.improvement !== null ? (
                            <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                              p.improvement >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {p.improvement >= 0 ? '+' : ''}{p.improvement}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {p.improvement !== null ? (
                            p.improvement >= 20 ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">Significant</span>
                            ) : p.improvement >= 0 ? (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">Moderate</span>
                            ) : (
                              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">Declined</span>
                            )
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">Incomplete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Response Count Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Survey Response Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {planTemplates.map(tmpl => {
                const resps = getTemplateResponses(tmpl.id);
                const qs = questions.filter(q => q.survey_template_id === tmpl.id);
                return (
                  <div key={tmpl.id} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      {surveyTypeLabels[tmpl.survey_type] || tmpl.survey_type}
                    </p>
                    <p className="text-sm font-medium text-slate-700 mb-3 line-clamp-1">{tmpl.title}</p>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Questions</span>
                        <span className="font-medium text-slate-700">{qs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Responses</span>
                        <span className="font-medium text-slate-700">{resps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Score</span>
                        <span className="font-medium text-slate-700">{getAverageScore(tmpl.id)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* No comparison data message */}
          {(!preTemplate || !postTemplate) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">Incomplete comparison data</p>
                  <p className="text-xs text-amber-600 mt-1">
                    To see pre/post comparison, ensure both a Pre-Training and Post-Training survey are configured with responses for this training plan.
                    {!preTemplate && ' Missing: Pre-Training survey.'}
                    {!postTemplate && ' Missing: Post-Training survey.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImpactReports;
