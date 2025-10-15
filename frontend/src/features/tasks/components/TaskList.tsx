import React from 'react';
import TaskItem from './TaskItem';
import { Task, ViewMode } from '../types';
import { Category } from '../../categories/types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  viewMode: ViewMode;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  categories: Category[];
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  viewMode,
  onTaskUpdate,
  onTaskDelete,
  onRefresh,
  categories,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className={`task-list ${viewMode}`}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          categories={categories}
          onUpdate={async (updates) => onTaskUpdate(task.id, updates)}
          onDelete={async () => onTaskDelete(task.id)}
          onRefresh={onRefresh}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default TaskList;
