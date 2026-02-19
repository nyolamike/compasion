import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import LoginModal from './LoginModal';
import Dashboard from './dashboard/Dashboard';
import TrainingPlans from './training/TrainingPlans';
import MaterialsLibrary from './materials/MaterialsLibrary';
import AttendanceSheet from './attendance/AttendanceSheet';
import ApprovalsQueue from './approvals/ApprovalsQueue';
import ParticipantsDirectory from './participants/ParticipantsDirectory';
import TrainingSessions from './sessions/TrainingSessions';
import FacilitiesManagement from './facilities/FacilitiesManagement';
import TrainingNeeds from './needs/TrainingNeeds';
import ReportsModule from './reports/ReportsModule';
import EvaluationModule from './evaluation/EvaluationModule';

const AppContent: React.FC = () => {
  const { currentView, isLoading, error } = useApp();

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading data from database...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center bg-red-50 p-8 rounded-2xl max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'needs':
        return <TrainingNeeds />;
      case 'plans':
        return <TrainingPlans />;
      case 'materials':
        return <MaterialsLibrary />;
      case 'facilities':
        return <FacilitiesManagement />;
      case 'sessions':
        return <TrainingSessions />;
      case 'attendance':
        return <AttendanceSheet />;
      case 'evaluation':
        return <EvaluationModule />;
      case 'participants':
        return <ParticipantsDirectory />;
      case 'approvals':
        return <ApprovalsQueue />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Settings</h2>
              <p className="text-slate-500 mt-2">System configuration and preferences</p>
              <p className="text-sm text-slate-400 mt-4">Coming soon in the next release</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }

  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
      <LoginModal />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default AppLayout;
