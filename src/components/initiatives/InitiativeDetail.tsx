import React from 'react';
import { DbInitiative, DbInitiativeStage, DbInitiativeTask } from '@/lib/database';
import StageSection from './StageSection';

interface InitiativeDetailProps {
  initiative: DbInitiative;
  stages: Array<DbInitiativeStage & { tasks: DbInitiativeTask[] }>;
  onAddTask: (stageId: string, taskData: Omit<DbInitiativeTask, 'id' | 'stage_id' | 'created_at' | 'updated_at'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<DbInitiativeTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

const InitiativeDetail: React.FC<InitiativeDetailProps> = ({
  initiative,
  stages,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      {/* Initiative header */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">{initiative.name}</h2>
        <p className="text-sm text-slate-500 mt-1">
          Created {new Date(initiative.created_at).toLocaleDateString()} by {initiative.created_by}
        </p>
      </div>

      {/* Stages */}
      <div className="p-6 space-y-6">
        {stages.map((stage) => (
          <StageSection
            key={stage.id}
            stage={stage}
            tasks={stage.tasks}
            onAddTask={(taskData) => onAddTask(stage.id, taskData)}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};

export default InitiativeDetail;
