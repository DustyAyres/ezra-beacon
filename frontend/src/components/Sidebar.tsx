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
    { path: '/myday', label: 'My Day', icon: 'fa-sun', count: 0 },
    { path: '/important', label: 'Important', icon: 'fa-star', count: 0 },
    { path: '/planned', label: 'Planned', icon: 'fa-calendar-days', count: 0 },
    { path: '/tasks', label: 'Tasks', icon: 'fa-list-check', count: 0 },
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
              <i className={`fas ${item.icon} sidebar-icon`}></i>
              <span className="sidebar-label">{item.label}</span>
              {item.count > 0 && <span className="sidebar-count">{item.count}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="tertiary w-button" onClick={onManageCategories}>
            Manage Categories
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
