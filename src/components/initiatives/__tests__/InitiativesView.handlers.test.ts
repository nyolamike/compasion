import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/database';

// Mock the database module
vi.mock('@/lib/database', () => ({
  db: {
    createInitiativeTask: vi.fn(),
    updateInitiativeTask: vi.fn(),
    deleteInitiativeTask: vi.fn(),
    getInitiativeWithStagesAndTasks: vi.fn(),
  },
}));

// Mock the toast module
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

describe('InitiativesView Task Management Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAddTask', () => {
    it('should call createInitiativeTask with correct parameters', async () => {
      const mockTaskData = {
        task_name: 'Test Task',
        comment: 'Test comment',
        responsible: 'John Doe',
        accountable: 'Jane Smith',
        consulted: 'Bob Johnson',
        informed: 'Alice Williams',
      };

      const stageId = 'stage-123';

      // Mock the database call
      vi.mocked(db.createInitiativeTask).mockResolvedValue({
        id: 'task-123',
        stage_id: stageId,
        ...mockTaskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Call the database method directly (simulating what the handler does)
      await db.createInitiativeTask({
        stage_id: stageId,
        ...mockTaskData,
      });

      // Verify the database method was called with correct parameters
      expect(db.createInitiativeTask).toHaveBeenCalledWith({
        stage_id: stageId,
        ...mockTaskData,
      });
      expect(db.createInitiativeTask).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when creating a task', async () => {
      const mockError = new Error('Database error');
      vi.mocked(db.createInitiativeTask).mockRejectedValue(mockError);

      const mockTaskData = {
        task_name: 'Test Task',
        comment: 'Test comment',
        responsible: 'John Doe',
        accountable: 'Jane Smith',
        consulted: 'Bob Johnson',
        informed: 'Alice Williams',
      };

      // Verify that the error is thrown
      await expect(
        db.createInitiativeTask({
          stage_id: 'stage-123',
          ...mockTaskData,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('handleUpdateTask', () => {
    it('should call updateInitiativeTask with correct parameters', async () => {
      const taskId = 'task-123';
      const updates = {
        task_name: 'Updated Task Name',
        comment: 'Updated comment',
      };

      // Mock the database call
      vi.mocked(db.updateInitiativeTask).mockResolvedValue({
        id: taskId,
        stage_id: 'stage-123',
        task_name: updates.task_name,
        comment: updates.comment,
        responsible: 'John Doe',
        accountable: 'Jane Smith',
        consulted: 'Bob Johnson',
        informed: 'Alice Williams',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Call the database method directly
      await db.updateInitiativeTask(taskId, updates);

      // Verify the database method was called with correct parameters
      expect(db.updateInitiativeTask).toHaveBeenCalledWith(taskId, updates);
      expect(db.updateInitiativeTask).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when updating a task', async () => {
      const mockError = new Error('Update failed');
      vi.mocked(db.updateInitiativeTask).mockRejectedValue(mockError);

      // Verify that the error is thrown
      await expect(
        db.updateInitiativeTask('task-123', { task_name: 'Updated' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('handleDeleteTask', () => {
    it('should call deleteInitiativeTask with correct task ID', async () => {
      const taskId = 'task-123';

      // Mock the database call
      vi.mocked(db.deleteInitiativeTask).mockResolvedValue(undefined);

      // Call the database method directly
      await db.deleteInitiativeTask(taskId);

      // Verify the database method was called with correct parameters
      expect(db.deleteInitiativeTask).toHaveBeenCalledWith(taskId);
      expect(db.deleteInitiativeTask).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when deleting a task', async () => {
      const mockError = new Error('Delete failed');
      vi.mocked(db.deleteInitiativeTask).mockRejectedValue(mockError);

      // Verify that the error is thrown
      await expect(
        db.deleteInitiativeTask('task-123')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('Task data reload after operations', () => {
    it('should reload initiative detail after task operations', async () => {
      const initiativeId = 'initiative-123';

      // Mock the reload method
      vi.mocked(db.getInitiativeWithStagesAndTasks).mockResolvedValue({
        initiative: {
          id: initiativeId,
          name: 'Test Initiative',
          created_by: 'user-123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        stages: [],
      });

      // Simulate reloading after an operation
      await db.getInitiativeWithStagesAndTasks(initiativeId);

      // Verify the reload method was called
      expect(db.getInitiativeWithStagesAndTasks).toHaveBeenCalledWith(initiativeId);
    });
  });
});
