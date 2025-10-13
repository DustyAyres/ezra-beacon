import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import Layout from './components/Layout';
import MyDayView from './components/MyDayView';
import ImportantView from './components/ImportantView';
import PlannedView from './components/PlannedView';
import TasksView from './components/TasksView';
import LoginPage from './components/LoginPage';
import { Category } from './types';
import api from './services/api';
import { useDevAuth } from './hooks/useDevAuth';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { isDevelopment, isDevAuthReady } = useDevAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  const isAuthenticatedOrDev = isAuthenticated || (isDevelopment && isDevAuthReady);

  useEffect(() => {
    if (isAuthenticatedOrDev) {
      loadCategories();
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
    <Layout categories={categories} onCategoriesChange={loadCategories}>
      <Routes>
        <Route path="/" element={<Navigate to="/myday" replace />} />
        <Route path="/myday" element={<MyDayView categories={categories} />} />
        <Route path="/important" element={<ImportantView categories={categories} />} />
        <Route path="/planned" element={<PlannedView categories={categories} />} />
        <Route path="/tasks" element={<TasksView categories={categories} />} />
      </Routes>
    </Layout>
  );
}

export default App;
