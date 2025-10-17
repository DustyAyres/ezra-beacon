import React, { useState } from 'react';
import { format } from 'date-fns';
import TaskDetails from './TaskDetails';
import { Task } from '../types';
import { ViewMode } from '../../../types';
import { Category } from '../../categories/types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  categories: Category[];
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  viewMode: ViewMode;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  categories,
  onUpdate,
  onDelete,
  onRefresh,
  viewMode,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleComplete = () => {
    onUpdate({ isCompleted: !task.isCompleted });
  };

  const handleToggleImportant = () => {
    onUpdate({ isImportant: !task.isImportant });
  };

  const formatDueDate = (date: string) => {
    return format(new Date(date), 'MMM d');
  };

  return (
    <>
      <div className={`task-item ${viewMode} ${task.isCompleted ? 'completed' : ''}`}>
        <button
          className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
          onClick={handleToggleComplete}
          aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.isCompleted && <i className="fas fa-check"></i>}
        </button>

        <div className="task-content" onClick={() => setShowDetails(true)}>
          <span className="task-title">{task.title}</span>
          <div className="task-meta">
            {task.category && (
              <span
                className="task-category"
                style={{ backgroundColor: task.category.colorHex }}
              >
                {task.category.name}
              </span>
            )}
            {task.dueDate && (
              <span className="task-due-date">
                <i className="fas fa-calendar"></i> {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.steps.length > 0 && (
              <span className="task-steps">
                {task.steps.filter(s => s.isCompleted).length} of {task.steps.length}
              </span>
            )}
          </div>
          {viewMode === 'grid' && (
            <button
              className={`task-important-grid ${task.isImportant ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleImportant();
              }}
              aria-label={task.isImportant ? 'Remove importance' : 'Mark as important'}
            >
              <i className={`${task.isImportant ? 'fas' : 'far'} fa-star`}></i>
            </button>
          )}
        </div>

        {viewMode === 'list' && (
          <button
            className={`task-important ${task.isImportant ? 'active' : ''}`}
            onClick={handleToggleImportant}
            aria-label={task.isImportant ? 'Remove importance' : 'Mark as important'}
          >
            <i className={`${task.isImportant ? 'fas' : 'far'} fa-star`}></i>
          </button>
        )}
      </div>

      {showDetails && (
        <TaskDetails
          task={task}
          categories={categories}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setShowDetails(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

export default TaskItem;
