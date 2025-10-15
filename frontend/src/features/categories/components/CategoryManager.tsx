import React, { useState } from 'react';
import { Category } from '../types';
import { APP_LIMITS } from '../../../config/constants';
import api from '../../../lib/api';
import './CategoryManager.css';

interface CategoryManagerProps {
  categories: Category[];
  onClose: () => void;
  onCategoriesChange: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onClose,
  onCategoriesChange,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ffcf33');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const predefinedColors = [
    '#ffcf33', // Yellow (Primary)
    '#00BCF2', // Light Blue
    '#00B294', // Teal
    '#009E49', // Green
    '#FF8C00', // Orange
    '#E81123', // Red
    '#EC008C', // Pink
    '#5C2D91', // Purple
    '#881798', // Dark Purple
  ];

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const categoryData = {
          name: newCategoryName.trim(),
          colorHex: newCategoryColor,
        };
        await api.createCategory(categoryData);
        setNewCategoryName('');
        setNewCategoryColor('#ffcf33');
        onCategoriesChange();
      } catch (error: any) {
        console.error('Failed to create category:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      }
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (editName.trim()) {
      try {
        await api.updateCategory(categoryId, {
          name: editName.trim(),
          colorHex: editColor,
        });
        setEditingCategory(null);
        onCategoriesChange();
      } catch (error) {
        console.error('Failed to update category:', error);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.deleteCategory(categoryId);
        onCategoriesChange();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditColor(category.colorHex);
  };

  return (
    <div className="category-manager-overlay" onClick={onClose}>
      <div className="category-manager" onClick={(e) => e.stopPropagation()}>
        <div className="category-manager-header">
          <h2>Manage Categories</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="category-manager-content">
          <div className="create-category">
            <h3>Create New Category</h3>
            <div className="create-category-form">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                maxLength={APP_LIMITS.MAX_CATEGORY_NAME_LENGTH}
              />
              <div className="color-picker">
                <div
                  className="color-preview"
                  style={{ backgroundColor: newCategoryColor }}
                />
                <div className="color-options">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${newCategoryColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                    />
                  ))}
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="custom-color"
                  />
                </div>
              </div>
              <button
                className="tertiary w-button"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
              >
                Create
              </button>
            </div>
          </div>

          <div className="existing-categories">
            <h3>Existing Categories</h3>
            {categories.length === 0 ? (
              <p className="no-categories">No categories yet</p>
            ) : (
              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    {editingCategory === category.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={APP_LIMITS.MAX_CATEGORY_NAME_LENGTH}
                        />
                        <div className="color-picker-inline">
                          <div
                            className="color-preview-small"
                            style={{ backgroundColor: editColor }}
                          />
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                          />
                        </div>
                        <button
                          className="tertiary w-button"
                          onClick={() => handleUpdateCategory(category.id)}
                        >
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button
                          className="secondary-button w-button"
                          onClick={() => setEditingCategory(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="category-info">
                          <span
                            className="category-color"
                            style={{ backgroundColor: category.colorHex }}
                          />
                          <span className="category-name">{category.name}</span>
                        </div>
                        <div className="category-actions">
                          <button
                            className="tertiary w-button"
                            onClick={() => startEditing(category)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="secondary-button w-button"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
