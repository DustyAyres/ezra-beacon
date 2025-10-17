import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import Sidebar from './Sidebar';
import CategoryManager from '../features/categories/components/CategoryManager';
import { Category } from '../features/categories/types';
import { TaskCounts } from '../types';
import { useDevAuth } from '../features/auth/hooks/useDevAuth';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  categories: Category[];
  onCategoriesChange: () => void;
  taskCounts: TaskCounts;
  onTaskCountsChange: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, categories, onCategoriesChange, taskCounts, onTaskCountsChange }) => {
  const { instance, accounts } = useMsal();
  const { logoutDevAuth, isDevAuthenticated } = useDevAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Add/remove body class for mobile sidebar
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    if (isDevAuthenticated) {
      // In development mode, use dev logout
      logoutDevAuth();
      window.location.reload();
    } else {
      instance.logoutPopup();
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/myday':
        return 'My Day';
      case '/important':
        return 'Important';
      case '/planned':
        return 'Planned';
      case '/tasks':
        return 'Tasks';
      default:
        return 'Ezra Beacon';
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <button
          className="menu-button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <i className="fas fa-bars menu-icon"></i>
        </button>
        <div className="header-content">
          <img src="/assets/icons/ezra-title-logo.svg" alt="Ezra" className="header-logo" />
          <nav className="header-nav">
          </nav>
          <div className="header-user">
            {process.env.REACT_APP_BYPASS_AUTH === 'true' && (
              <span className="dev-mode-badge">DEV MODE</span>
            )}
            <span className="user-name">{accounts[0]?.name || 'User'}</span>
            <button className="logout-button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onManageCategories={() => setShowCategoryManager(true)}
          taskCounts={taskCounts}
        />
        
        <main className="main-content">
          <div 
            className="orb-background"
            style={{
              position: 'fixed',
              top: '-30vh',
              right: '-80vw',
              width: '200%',
              height: '200%',
              backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/large-orb-white.png)`,
              backgroundRepeat: 'no-repeat',
              opacity: 0.3,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="page-header">
              <h1 className="page-title">{getPageTitle()}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategoryManager(false)}
          onCategoriesChange={onCategoriesChange}
        />
      )}
    </div>
  );
};

export default Layout;
