import React, { useState } from 'react';
import { DbInitiativeTask } from '@/lib/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface TaskTableProps {
  tasks: DbInitiativeTask[];
  onUpdate: (taskId: string, updates: Partial<DbInitiativeTask>) => void;
  onDelete: (taskId: string) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DbInitiativeTask>>({});

  const startEdit = (task: DbInitiativeTask) => {
    setEditingId(task.id);
    setEditData({
      task_name: task.task_name,
      comment: task.comment,
      responsible: task.responsible,
      accountable: task.accountable,
      consulted: task.consulted,
      informed: task.informed,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = (taskId: string) => {
    onUpdate(taskId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(taskId);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Task</TableHead>
            <TableHead className="w-[250px]">Comment</TableHead>
            <TableHead className="w-[150px]">Responsible</TableHead>
            <TableHead className="w-[150px]">Accountable</TableHead>
            <TableHead className="w-[150px]">Consulted</TableHead>
            <TableHead className="w-[150px]">Informed</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              {editingId === task.id ? (
                <>
                  <TableCell>
                    <Input
                      value={editData.task_name || ''}
                      onChange={(e) => setEditData({ ...editData, task_name: e.target.value })}
                      className="min-w-[180px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={editData.comment || ''}
                      onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                      className="min-w-[230px] min-h-[60px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.responsible || ''}
                      onChange={(e) => setEditData({ ...editData, responsible: e.target.value })}
                      className="min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.accountable || ''}
                      onChange={(e) => setEditData({ ...editData, accountable: e.target.value })}
                      className="min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.consulted || ''}
                      onChange={(e) => setEditData({ ...editData, consulted: e.target.value })}
                      className="min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.informed || ''}
                      onChange={(e) => setEditData({ ...editData, informed: e.target.value })}
                      className="min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveEdit(task.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{task.task_name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{task.comment || '-'}</TableCell>
                  <TableCell className="text-sm">{task.responsible || '-'}</TableCell>
                  <TableCell className="text-sm">{task.accountable || '-'}</TableCell>
                  <TableCell className="text-sm">{task.consulted || '-'}</TableCell>
                  <TableCell className="text-sm">{task.informed || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(task)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(task.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
