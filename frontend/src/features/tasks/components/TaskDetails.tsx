import React, { useState } from 'react';
import { format } from 'date-fns';
import { Task, TaskStep } from '../types';
import { RecurrenceType } from '../../../types';
import { Category } from '../../categories/types';
import { APP_LIMITS } from '../../../config/constants';
import api from '../../../lib/api';
import './TaskDetails.css';

interface TaskDetailsProps {
  task: Task;
  categories: Category[];
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  categories,
  onUpdate,
  onDelete,
  onClose,
  onRefresh,
}) => {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [categoryId, setCategoryId] = useState(task.categoryId || '');
  const [recurrenceType, setRecurrenceType] = useState(task.recurrenceType || RecurrenceType.None);
  const [newStepTitle, setNewStepTitle] = useState('');
  
  // Local state for steps management
  const [localSteps, setLocalSteps] = useState<TaskStep[]>([...task.steps]);
  const [newSteps, setNewSteps] = useState<{ title: string; tempId: string }[]>([]);
  const [deletedStepIds, setDeletedStepIds] = useState<string[]>([]);
  const [updatedSteps, setUpdatedSteps] = useState<Record<string, Partial<TaskStep>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update task details first
      const updates: Partial<Task> = {
        title,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        categoryId: categoryId || undefined,
        recurrenceType,
      };
      await onUpdate(updates);

      // Handle step changes in parallel where possible
      const stepPromises: Promise<any>[] = [];

      // 1. Delete removed steps
      deletedStepIds.forEach(stepId => {
        stepPromises.push(api.deleteStep(task.id, stepId));
      });

      // 2. Update existing steps
      Object.entries(updatedSteps).forEach(([stepId, updates]) => {
        stepPromises.push(api.updateStep(task.id, stepId, updates));
      });

      // Wait for all deletes and updates to complete
      await Promise.all(stepPromises);

      // 3. Add new steps (these need to be sequential to maintain order)
      for (let i = 0; i < newSteps.length; i++) {
        await api.addStep(task.id, { 
          title: newSteps[i].title
        });
      }

      // Refresh parent data if callback provided
      if (onRefresh) {
        await onRefresh();
      }

      // Close only after everything is done
      onClose();
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStep = () => {
    if (newStepTitle.trim() && localSteps.length + newSteps.length < APP_LIMITS.MAX_STEPS_PER_TASK) {
      const tempId = `temp-${crypto.randomUUID()}`;
      setNewSteps([...newSteps, { title: newStepTitle.trim(), tempId }]);
      setNewStepTitle('');
    }
  };

  const handleStepToggle = (stepId: string, isCompleted: boolean) => {
    // Update local state for existing steps
    if (!stepId.startsWith('temp-')) {
      setLocalSteps(localSteps.map(step => 
        step.id === stepId ? { ...step, isCompleted } : step
      ));
      setUpdatedSteps({
        ...updatedSteps,
        [stepId]: { ...updatedSteps[stepId], isCompleted }
      });
    }
  };

  const handleStepDelete = (stepId: string) => {
    if (stepId.startsWith('temp-')) {
      // Remove from new steps
      const tempId = stepId;
      setNewSteps(newSteps.filter(step => step.tempId !== tempId));
    } else {
      // Mark existing step for deletion
      setLocalSteps(localSteps.filter(step => step.id !== stepId));
      setDeletedStepIds([...deletedStepIds, stepId]);
      // Remove from updated steps if it was there
      const { [stepId]: _, ...rest } = updatedSteps;
      setUpdatedSteps(rest);
    }
  };

  return (
    <div className="task-details-overlay" onClick={onClose}>
      <div className="task-details" onClick={(e) => e.stopPropagation()}>
        <div className="task-details-header">
          <h2>Task Details</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="task-details-content">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={APP_LIMITS.MAX_TASK_TITLE_LENGTH}
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Repeat</label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(Number(e.target.value) as RecurrenceType)}
            >
              <option value={RecurrenceType.None}>Never</option>
              <option value={RecurrenceType.Daily}>Daily</option>
              <option value={RecurrenceType.Weekdays}>Weekdays</option>
              <option value={RecurrenceType.Weekly}>Weekly</option>
              <option value={RecurrenceType.Monthly}>Monthly</option>
              <option value={RecurrenceType.Yearly}>Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Steps ({localSteps.length + newSteps.length}/{APP_LIMITS.MAX_STEPS_PER_TASK})</label>
            <div className="steps-list">
              {/* Render existing steps */}
              {localSteps.map((step) => (
                <div key={step.id} className="step-item">
                  <input
                    type="checkbox"
                    checked={updatedSteps[step.id]?.isCompleted ?? step.isCompleted}
                    onChange={(e) => handleStepToggle(step.id, e.target.checked)}
                  />
                  <span className={(updatedSteps[step.id]?.isCompleted ?? step.isCompleted) ? 'completed' : ''}>
                    {step.title}
                  </span>
                  <button
                    className="step-delete"
                    onClick={() => handleStepDelete(step.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              
              {/* Render new steps */}
              {newSteps.map((step) => (
                <div key={step.tempId} className="step-item new-step">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                  />
                  <span>{step.title}</span>
                  <button
                    className="step-delete"
                    onClick={() => handleStepDelete(step.tempId)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            {localSteps.length + newSteps.length < APP_LIMITS.MAX_STEPS_PER_TASK && (
              <div className="add-step">
                <input
                  type="text"
                  placeholder="Add a step"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                  maxLength={APP_LIMITS.MAX_STEP_TITLE_LENGTH}
                />
                <button onClick={handleAddStep}>Add</button>
              </div>
            )}
          </div>
        </div>

        <div className="task-details-footer">
          <button className="btn-delete" onClick={async () => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              setIsSaving(true);
              try {
                await onDelete();
                if (onRefresh) {
                  await onRefresh();
                }
                onClose();
              } catch (error) {
                console.error('Failed to delete task:', error);
                alert('Failed to delete task. Please try again.');
                setIsSaving(false);
              }
            }
          }} disabled={isSaving}>
            {isSaving ? 'Deleting...' : 'Delete Task'}
          </button>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
