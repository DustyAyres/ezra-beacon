import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import Layout from './components/Layout';
import MyDayView from './features/tasks/components/MyDayView';
import ImportantView from './features/tasks/components/ImportantView';
import PlannedView from './features/tasks/components/PlannedView';
import TasksView from './features/tasks/components/TasksView';
import LoginPage from './features/auth/components/LoginPage';
import { Category } from './features/categories/types';
import { TaskCounts } from './features/tasks/types';
import api from './lib/api';
import { useDevAuth } from './features/auth/hooks/useDevAuth';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { isDevelopment, isDevAuthReady } = useDevAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    myDay: 0,
    important: 0,
    planned: 0,
    all: 0
  });

  const isAuthenticatedOrDev = isAuthenticated || (isDevelopment && isDevAuthReady);

  useEffect(() => {
    if (isAuthenticatedOrDev) {
      loadCategories();
      loadTaskCounts();
    }
  }, [isAuthenticatedOrDev]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTaskCounts = async () => {
    try {
      const counts = await api.getTaskCounts();
      setTaskCounts(counts);
    } catch (error) {
      console.error('Failed to load task counts:', error);
    }
  };

  // Show loading only when in production mode or dev auth is not ready
  if (!isDevelopment && (inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.HandleRedirect)) {
    return <div className="loading">Loading...</div>;
  }

  if (isDevelopment && !isDevAuthReady) {
    return <div className="loading">Initializing development mode...</div>;
  }

  if (!isAuthenticatedOrDev) {
    return <LoginPage />;
  }

  return (
    <Layout categories={categories} onCategoriesChange={loadCategories} taskCounts={taskCounts} onTaskCountsChange={loadTaskCounts}>
      <Routes>
        <Route path="/" element={<Navigate to="/myday" replace />} />
        <Route path="/myday" element={<MyDayView categories={categories} onTaskChange={loadTaskCounts} />} />
        <Route path="/important" element={<ImportantView categories={categories} onTaskChange={loadTaskCounts} />} />
        <Route path="/planned" element={<PlannedView categories={categories} onTaskChange={loadTaskCounts} />} />
        <Route path="/tasks" element={<TasksView categories={categories} onTaskChange={loadTaskCounts} />} />
      </Routes>
    </Layout>
  );
}

export default App;
