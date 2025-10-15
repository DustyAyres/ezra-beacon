import React, { useState, useEffect } from 'react';
import { isToday, isTomorrow, isThisWeek, startOfToday } from 'date-fns';
import TaskList from './TaskList';
import AddTask from './AddTask';
import ViewControls from './ViewControls';
import { Task, SortBy, ViewMode } from '../types';
import { Category } from '../../categories/types';
import api from '../../../lib/api';
import './TaskView.css';

interface PlannedViewProps {
  categories: Category[];
  onTaskChange?: () => void;
}

const PlannedView: React.FC<PlannedViewProps> = ({ categories, onTaskChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('duedate');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [groupByCategory, setGroupByCategory] = useState(false);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedCategory]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks('planned', sortBy, selectedCategory || undefined);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (title: string) => {
    try {
      await api.createTask({
        title,
        dueDate: new Date().toISOString(),
        isImportant: false,
        categoryId: selectedCategory || undefined,
      });
      await loadTasks();
      onTaskChange?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.updateTask(taskId, updates);
      await loadTasks();
      onTaskChange?.();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      await loadTasks();
      onTaskChange?.();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Group tasks by date categories
  const groupTasksByDate = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {
      'Earlier': [],
      'Today': [],
      'Tomorrow': [],
      'This Week': [],
      'Later': []
    };

    const today = startOfToday();

    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const dueDate = new Date(task.dueDate);
      
      if (dueDate < today) {
        groups['Earlier'].push(task);
      } else if (isToday(dueDate)) {
        groups['Today'].push(task);
      } else if (isTomorrow(dueDate)) {
        groups['Tomorrow'].push(task);
      } else if (isThisWeek(dueDate)) {
        groups['This Week'].push(task);
      } else {
        groups['Later'].push(task);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, tasks]) => tasks.length > 0);
  };

  const groupedByDate = groupTasksByDate(tasks);
  
  // Further group by category if needed
  const finalGroups = groupByCategory
    ? groupedByDate.flatMap(([dateGroup, dateTasks]) => {
        const categoryGroups = dateTasks.reduce((groups, task) => {
          const categoryName = task.category?.name || 'Uncategorized';
          const key = `${dateGroup} - ${categoryName}`;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(task);
          return groups;
        }, {} as Record<string, Task[]>);
        return Object.entries(categoryGroups);
      })
    : groupedByDate;

  return (
    <div className="task-view">
      <div className="task-view-header">
        <ViewControls
          viewMode={viewMode}
          sortBy={sortBy}
          onViewModeChange={setViewMode}
          onSortChange={setSortBy}
          groupByCategory={groupByCategory}
          onGroupByCategoryChange={setGroupByCategory}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
      </div>

      <AddTask onAdd={handleTaskCreate} placeholder="Add a task" />

      {loading ? (
        <div className="loading-tasks">Loading tasks...</div>
      ) : (
        <div className="task-groups">
          {finalGroups.map(([groupName, groupTasks]) => (
            <div key={groupName} className="task-group">
              <h3 className="task-group-title">
                {groupName}
                <span className="task-group-count">{groupTasks.length}</span>
              </h3>
              <TaskList
                tasks={groupTasks}
                viewMode={viewMode}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onRefresh={loadTasks}
                categories={categories}
              />
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="empty-state">
              <p>No planned tasks. Add one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlannedView;
