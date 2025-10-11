import React, { useState } from 'react';
import { format } from 'date-fns';
import TaskDetails from './TaskDetails';
import { Task, Category, ViewMode } from '../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  categories: Category[];
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  viewMode: ViewMode;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  categories,
  onUpdate,
  onDelete,
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
          {task.isCompleted && '✓'}
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
                📅 {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.steps.length > 0 && (
              <span className="task-steps">
                {task.steps.filter(s => s.isCompleted).length} of {task.steps.length}
              </span>
            )}
          </div>
        </div>

        <button
          className={`task-important ${task.isImportant ? 'active' : ''}`}
          onClick={handleToggleImportant}
          aria-label={task.isImportant ? 'Remove importance' : 'Mark as important'}
        >
          ⭐
        </button>
      </div>

      {showDetails && (
        <TaskDetails
          task={task}
          categories={categories}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default TaskItem;
