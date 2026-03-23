import React, { useState } from 'react';
import { DbInitiativeStage, DbInitiativeTask } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import TaskTable from './TaskTable';

interface StageSectionProps {
  stage: DbInitiativeStage;
  tasks: DbInitiativeTask[];
  onAddTask: (taskData: Omit<DbInitiativeTask, 'id' | 'stage_id' | 'created_at' | 'updated_at'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<DbInitiativeTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

const StageSection: React.FC<StageSectionProps> = ({
  stage,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    task_name: '',
    comment: '',
    responsible: '',
    accountable: '',
    consulted: '',
    informed: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.task_name.trim()) {
      return;
    }

    onAddTask(newTask);
    
    // Reset form
    setNewTask({
      task_name: '',
      comment: '',
      responsible: '',
      accountable: '',
      consulted: '',
      informed: '',
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewTask({
      task_name: '',
      comment: '',
      responsible: '',
      accountable: '',
      consulted: '',
      informed: '',
    });
    setIsAdding(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Stage header */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{stage.stage_name}</h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
            className="bg-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        )}
      </div>

      {/* Tasks */}
      <div className="p-6">
        {/* Add task form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <Label htmlFor="task_name">Task Name *</Label>
                <Input
                  id="task_name"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                  placeholder="Enter task name"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={newTask.comment}
                  onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })}
                  placeholder="Enter task details or notes"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="responsible">Responsible</Label>
                <Input
                  id="responsible"
                  value={newTask.responsible}
                  onChange={(e) => setNewTask({ ...newTask, responsible: e.target.value })}
                  placeholder="Who carries out the task"
                />
              </div>

              <div>
                <Label htmlFor="accountable">Accountable</Label>
                <Input
                  id="accountable"
                  value={newTask.accountable}
                  onChange={(e) => setNewTask({ ...newTask, accountable: e.target.value })}
                  placeholder="Who is answerable"
                />
              </div>

              <div>
                <Label htmlFor="consulted">Consulted</Label>
                <Input
                  id="consulted"
                  value={newTask.consulted}
                  onChange={(e) => setNewTask({ ...newTask, consulted: e.target.value })}
                  placeholder="Whose input is sought"
                />
              </div>

              <div>
                <Label htmlFor="informed">Informed</Label>
                <Input
                  id="informed"
                  value={newTask.informed}
                  onChange={(e) => setNewTask({ ...newTask, informed: e.target.value })}
                  placeholder="Who is kept updated"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Add Task
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Task table */}
        <TaskTable
          tasks={tasks}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      </div>
    </div>
  );
};

export default StageSection;
