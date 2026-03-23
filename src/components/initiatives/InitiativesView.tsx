import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db, DbInitiative, DbInitiativeStage, DbInitiativeTask } from '@/lib/database';
import { toast } from '@/components/ui/use-toast';
import InitiativesList from './InitiativesList';
import InitiativeDetail from './InitiativeDetail';
import CreateInitiativeDialog from './CreateInitiativeDialog';

interface InitiativeWithStages {
  initiative: DbInitiative;
  stages: Array<DbInitiativeStage & { tasks: DbInitiativeTask[] }>;
}

const InitiativesView: React.FC = () => {
  const { currentUser } = useApp();
  
  // State management
  const [initiatives, setInitiatives] = useState<DbInitiative[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [initiativeData, setInitiativeData] = useState<InitiativeWithStages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Load initiatives on mount
  useEffect(() => {
    loadInitiatives();
  }, []);

  // Load initiative detail when selection changes
  useEffect(() => {
    if (selectedInitiativeId) {
      loadInitiativeDetail(selectedInitiativeId);
    } else {
      setInitiativeData(null);
    }
  }, [selectedInitiativeId]);

  /**
   * Load all initiatives from database
   */
  const loadInitiatives = async () => {
    setIsLoading(true);
    try {
      const data = await db.getInitiatives();
      setInitiatives(data);
      
      // Auto-select first initiative if available
      if (data.length > 0 && !selectedInitiativeId) {
        setSelectedInitiativeId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load initiatives:', error);
      toast({
        title: 'Error',
        description: 'Failed to load initiatives. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load complete initiative data with stages and tasks
   */
  const loadInitiativeDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const data = await db.getInitiativeWithStagesAndTasks(id);
      setInitiativeData(data);
    } catch (error) {
      console.error('Failed to load initiative detail:', error);
      toast({
        title: 'Error',
        description: 'Failed to load initiative details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  /**
   * Create a new initiative with all four stages
   */
  const handleCreateInitiative = async (name: string) => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create an initiative.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create the initiative
      const newInitiative = await db.createInitiative({
        name,
        created_by: currentUser.id,
      });

      // Create all four stages
      const stages: Array<{ stage_name: 'PLAN' | 'IMPLEMENT' | 'EVALUATE' | 'CLOSE'; stage_order: number }> = [
        { stage_name: 'PLAN', stage_order: 1 },
        { stage_name: 'IMPLEMENT', stage_order: 2 },
        { stage_name: 'EVALUATE', stage_order: 3 },
        { stage_name: 'CLOSE', stage_order: 4 },
      ];

      for (const stage of stages) {
        await db.createInitiativeStage({
          initiative_id: newInitiative.id,
          stage_name: stage.stage_name,
          stage_order: stage.stage_order,
        });
      }

      // Show success message
      toast({
        title: 'Success',
        description: `Initiative "${name}" created successfully.`,
      });

      // Refresh initiatives list
      await loadInitiatives();

      // Select the newly created initiative
      setSelectedInitiativeId(newInitiative.id);
    } catch (error) {
      console.error('Failed to create initiative:', error);
      toast({
        title: 'Error',
        description: 'Failed to create initiative. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Add a new task to a stage
   */
  const handleAddTask = async (stageId: string, taskData: Omit<DbInitiativeTask, 'id' | 'stage_id' | 'created_at' | 'updated_at'>) => {
    try {
      await db.createInitiativeTask({
        stage_id: stageId,
        ...taskData,
      });

      toast({
        title: 'Success',
        description: 'Task added successfully.',
      });

      // Reload initiative detail to show updated data
      if (selectedInitiativeId) {
        await loadInitiativeDetail(selectedInitiativeId);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Update an existing task
   */
  const handleUpdateTask = async (taskId: string, updates: Partial<DbInitiativeTask>) => {
    try {
      await db.updateInitiativeTask(taskId, updates);

      toast({
        title: 'Success',
        description: 'Task updated successfully.',
      });

      // Reload initiative detail to show updated data
      if (selectedInitiativeId) {
        await loadInitiativeDetail(selectedInitiativeId);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (taskId: string) => {
    try {
      await db.deleteInitiativeTask(taskId);

      toast({
        title: 'Success',
        description: 'Task deleted successfully.',
      });

      // Reload initiative detail to show updated data
      if (selectedInitiativeId) {
        await loadInitiativeDetail(selectedInitiativeId);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading initiatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CIUG Initiatives</h1>
          <p className="text-slate-500 mt-1">Manage initiatives through the 4-stage lifecycle</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Initiatives list */}
        <div className="lg:col-span-1">
          <InitiativesList
            initiatives={initiatives}
            selectedId={selectedInitiativeId}
            onSelect={setSelectedInitiativeId}
            onCreateClick={() => setIsCreateDialogOpen(true)}
          />
        </div>

        {/* Right column: Initiative detail */}
        <div className="lg:col-span-3">
          {!selectedInitiativeId ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No Initiative Selected</h3>
              <p className="text-slate-500 mt-2">Select an initiative from the list to view details</p>
            </div>
          ) : isLoadingDetail ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading initiative details...</p>
            </div>
          ) : initiativeData ? (
            <InitiativeDetail
              initiative={initiativeData.initiative}
              stages={initiativeData.stages}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : null}
        </div>
      </div>

      {/* Create Initiative Dialog */}
      <CreateInitiativeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateInitiative}
      />
    </div>
  );
};

export default InitiativesView;
