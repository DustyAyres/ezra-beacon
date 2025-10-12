import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import Sidebar from './Sidebar';
import CategoryManager from './CategoryManager';
import { Category } from '../types';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  categories: Category[];
  onCategoriesChange: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, categories, onCategoriesChange }) => {
  const { instance, accounts } = useMsal();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const handleLogout = () => {
    if (process.env.REACT_APP_BYPASS_AUTH === 'true') {
      // In development mode, just reload the page
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
            <Link to="/myday" className={location.pathname === '/myday' ? 'active' : ''}>
              My Day
            </Link>
            <Link to="/important" className={location.pathname === '/important' ? 'active' : ''}>
              Important
            </Link>
            <Link to="/planned" className={location.pathname === '/planned' ? 'active' : ''}>
              Planned
            </Link>
            <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>
              Tasks
            </Link>
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
        />
        
        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          {children}
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
