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

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  if (inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.HandleRedirect) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
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
