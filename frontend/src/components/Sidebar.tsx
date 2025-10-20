import React from 'react';
import { NavLink } from 'react-router-dom';
import { TaskCounts } from '../types';
import { APP_BREAKPOINTS } from '../config/constants';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onManageCategories: () => void;
  taskCounts: TaskCounts;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onManageCategories, taskCounts }) => {
  const navItems = [
    { path: '/myday', label: 'My Day', icon: 'fa-sun', count: taskCounts.myDay },
    { path: '/important', label: 'Important', icon: 'fa-star', count: taskCounts.important },
    { path: '/planned', label: 'Planned', icon: 'fa-calendar-days', count: taskCounts.planned },
    { path: '/tasks', label: 'Tasks', icon: 'fa-list-check', count: taskCounts.all },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => {
                  if (window.innerWidth <= APP_BREAKPOINTS.MOBILE) {
                    onClose();
                  }
              }}
            >
              <i className={`fas ${item.icon} sidebar-icon`}></i>
              <span className="sidebar-label">{item.label}</span>
              {item.count > 0 && <span className="sidebar-count">{item.count}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="tertiary w-button" onClick={() => {
            onManageCategories();
                  if (window.innerWidth <= APP_BREAKPOINTS.MOBILE) {
                    onClose();
                  }
          }}>
            Manage Categories
          </button>
        </div>
      </aside>
      {isOpen && window.innerWidth <= APP_BREAKPOINTS.MOBILE && (
        <div className="sidebar-overlay" data-testid="sidebar-overlay" onClick={onClose} />
      )}
    </>
  );
};

export default Sidebar;
