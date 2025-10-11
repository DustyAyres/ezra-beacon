import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import AddTask from './AddTask';
import ViewControls from './ViewControls';
import { Task, Category, SortBy, ViewMode } from '../types';
import api from '../services/api';
import './TaskView.css';

interface ImportantViewProps {
  categories: Category[];
}

const ImportantView: React.FC<ImportantViewProps> = ({ categories }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('creationdate');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [groupByCategory, setGroupByCategory] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [sortBy, selectedCategory]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks('important', sortBy, selectedCategory || undefined);
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
        isImportant: true, // Set as important by default
        dueDate: undefined,
        categoryId: selectedCategory || undefined,
      });
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.updateTask(taskId, updates);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const sortedByCreationDate = sortBy === 'creationdate' ? 'Sorted by creation date' : '';

  const groupedTasks = groupByCategory
    ? tasks.reduce((groups, task) => {
        const categoryName = task.category?.name || 'Uncategorized';
        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }
        groups[categoryName].push(task);
        return groups;
      }, {} as Record<string, Task[]>)
    : { 'All Tasks': tasks };

  return (
    <div className="task-view">
      <div className="task-view-header">
        <div className="task-view-date">{sortedByCreationDate}</div>
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

      <AddTask onAdd={handleTaskCreate} placeholder="Add an important task" />

      {loading ? (
        <div className="loading-tasks">Loading tasks...</div>
      ) : (
        <div className="task-groups">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName} className="task-group">
              {groupByCategory && (
                <h3 className="task-group-title">
                  {groupName}
                  {groupName !== 'Uncategorized' && (
                    <span
                      className="task-group-color"
                      style={{
                        backgroundColor: categories.find(c => c.name === groupName)?.colorHex
                      }}
                    />
                  )}
                </h3>
              )}
              <TaskList
                tasks={groupTasks}
                viewMode={viewMode}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                categories={categories}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportantView;
