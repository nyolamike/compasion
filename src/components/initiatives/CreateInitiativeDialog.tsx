import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateInitiativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}

const CreateInitiativeDialog: React.FC<CreateInitiativeDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('Initiative name is required');
      return;
    }
    
    if (name.length > 200) {
      setError('Initiative name must be 200 characters or less');
      return;
    }

    // Submit
    onSubmit(name.trim());
    
    // Reset form
    setName('');
    setError('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setName('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Initiative</DialogTitle>
            <DialogDescription>
              Enter a name for your new initiative. All four stages (PLAN, IMPLEMENT, EVALUATE, CLOSE) will be created automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Initiative Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Enter initiative name"
                maxLength={200}
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <p className="text-xs text-slate-500">
                {name.length}/200 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Initiative
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInitiativeDialog;
