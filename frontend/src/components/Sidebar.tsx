import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onManageCategories: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onManageCategories }) => {
  const navItems = [
    { path: '/myday', label: 'My Day', icon: '☀️', count: 0 },
    { path: '/important', label: 'Important', icon: '⭐', count: 0 },
    { path: '/planned', label: 'Planned', icon: '📅', count: 0 },
    { path: '/tasks', label: 'Tasks', icon: '📋', count: 0 },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => isOpen && onClose()}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.count > 0 && <span className="sidebar-count">{item.count}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="manage-categories-btn" onClick={onManageCategories}>
            Manage Categories
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
