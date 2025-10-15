import React from 'react';
import { SortBy, ViewMode } from '../types';
import { Category } from '../../categories/types';
import './ViewControls.css';

interface ViewControlsProps {
  viewMode: ViewMode;
  sortBy: SortBy;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortBy) => void;
  groupByCategory: boolean;
  onGroupByCategoryChange: (group: boolean) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
}

const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
  groupByCategory,
  onGroupByCategoryChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className="view-controls">
      <div className="view-mode-toggle">
        <button
          className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid view"
        >
          <i className="fas fa-grip icon"></i> Grid
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
          title="List view"
        >
          <i className="fas fa-list icon"></i> List
        </button>
      </div>

      <div className="view-options">
        <div className="dropdown">
          <label className="dropdown-label">Sort by:</label>
          <select
            className="dropdown-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
          >
            <option value="importance">Importance</option>
            <option value="duedate">Due Date</option>
            <option value="alphabetically">Alphabetically</option>
            <option value="creationdate">Creation Date</option>
          </select>
        </div>

        <div className="dropdown">
          <label className="dropdown-label">Category:</label>
          <select
            className="dropdown-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={groupByCategory}
            onChange={(e) => onGroupByCategoryChange(e.target.checked)}
          />
          <span>Group by Category</span>
        </label>
      </div>
    </div>
  );
};

export default ViewControls;
