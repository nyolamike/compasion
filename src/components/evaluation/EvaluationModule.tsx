import React, { useState } from 'react';
import { DbSurveyTemplate } from '@/lib/database';
import SurveyTemplates from './SurveyTemplates';
import SurveyBuilder from './SurveyBuilder';
import ScheduledAssessments from './ScheduledAssessments';
import ImpactReports from './ImpactReports';

type TabId = 'templates' | 'schedule' | 'impact';

interface Tab {
  id: TabId;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'templates',
    label: 'Survey Templates',
    description: 'Create and manage evaluation surveys',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'Scheduled Assessments',
    description: 'Follow-up assessments at 3-6 month intervals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'impact',
    label: 'Impact Reports',
    description: 'Pre/post training metrics comparison',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const EvaluationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [editingTemplate, setEditingTemplate] = useState<DbSurveyTemplate | null>(null);

  const handleViewQuestions = (template: DbSurveyTemplate) => {
    setEditingTemplate(template);
  };

  const handleBackFromBuilder = () => {
    setEditingTemplate(null);
  };

  const renderContent = () => {
    // If editing a template's questions, show the builder
    if (editingTemplate) {
      return <SurveyBuilder template={editingTemplate} onBack={handleBackFromBuilder} />;
    }

    switch (activeTab) {
      case 'templates':
        return <SurveyTemplates onViewQuestions={handleViewQuestions} />;
      case 'schedule':
        return <ScheduledAssessments />;
      case 'impact':
        return <ImpactReports />;
      default:
        return <SurveyTemplates onViewQuestions={handleViewQuestions} />;
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Evaluation</h2>
            <p className="text-sm text-slate-500">Surveys, follow-up assessments, and training impact analysis</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {!editingTemplate && (
        <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      {renderContent()}
    </div>
  );
};

export default EvaluationModule;
