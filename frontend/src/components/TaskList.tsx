import React from 'react';
import TaskItem from './TaskItem';
import { Task, Category, ViewMode } from '../types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  viewMode: ViewMode;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  categories: Category[];
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  viewMode,
  onTaskUpdate,
  onTaskDelete,
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
          onUpdate={(updates) => onTaskUpdate(task.id, updates)}
          onDelete={() => onTaskDelete(task.id)}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default TaskList;
