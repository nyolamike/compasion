import React from 'react';
import { DbInitiative } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InitiativesListProps {
  initiatives: DbInitiative[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}

const InitiativesList: React.FC<InitiativesListProps> = ({
  initiatives,
  selectedId,
  onSelect,
  onCreateClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Header with Create button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Initiatives</h2>
        <Button
          onClick={onCreateClick}
          size="sm"
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>

      {/* Initiatives list */}
      {initiatives.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">No initiatives yet</p>
          <p className="text-slate-400 text-xs mt-1">Click "New" to create your first initiative</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
          {initiatives.map((initiative) => (
            <button
              key={initiative.id}
              onClick={() => onSelect(initiative.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedId === initiative.id
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <p className="font-medium truncate">{initiative.name}</p>
              <p className={`text-xs mt-1 ${
                selectedId === initiative.id ? 'text-white/80' : 'text-slate-500'
              }`}>
                {new Date(initiative.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InitiativesList;
