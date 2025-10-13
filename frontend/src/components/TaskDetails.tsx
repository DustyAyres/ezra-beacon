import React, { useState } from 'react';
import { format } from 'date-fns';
import { Task, Category, RecurrenceType } from '../types';
import api from '../services/api';
import './TaskDetails.css';

interface TaskDetailsProps {
  task: Task;
  categories: Category[];
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  categories,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [categoryId, setCategoryId] = useState(task.categoryId || '');
  const [recurrenceType, setRecurrenceType] = useState(task.recurrenceType || RecurrenceType.None);
  const [newStepTitle, setNewStepTitle] = useState('');

  const handleSave = () => {
    const updates: Partial<Task> = {
      title,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      categoryId: categoryId || undefined,
      recurrenceType,
    };
    onUpdate(updates);
    onClose();
  };

  const handleAddStep = async () => {
    if (newStepTitle.trim()) {
      try {
        await api.addStep(task.id, { title: newStepTitle.trim() });
        setNewStepTitle('');
        // Refresh task data
        window.location.reload(); // Simple refresh for now
      } catch (error) {
        console.error('Failed to add step:', error);
      }
    }
  };

  const handleStepToggle = async (stepId: string, isCompleted: boolean) => {
    try {
      await api.updateStep(task.id, stepId, { isCompleted });
      // Refresh task data
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to update step:', error);
    }
  };

  const handleStepDelete = async (stepId: string) => {
    try {
      await api.deleteStep(task.id, stepId);
      // Refresh task data
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to delete step:', error);
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
              maxLength={255}
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
            <label>Steps ({task.steps.length}/100)</label>
            <div className="steps-list">
              {task.steps.map((step) => (
                <div key={step.id} className="step-item">
                  <input
                    type="checkbox"
                    checked={step.isCompleted}
                    onChange={(e) => handleStepToggle(step.id, e.target.checked)}
                  />
                  <span className={step.isCompleted ? 'completed' : ''}>{step.title}</span>
                  <button
                    className="step-delete"
                    onClick={() => handleStepDelete(step.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            {task.steps.length < 100 && (
              <div className="add-step">
                <input
                  type="text"
                  placeholder="Add a step"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                  maxLength={255}
                />
                <button onClick={handleAddStep}>Add</button>
              </div>
            )}
          </div>
        </div>

        <div className="task-details-footer">
          <button className="btn-delete" onClick={onDelete}>
            Delete Task
          </button>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
