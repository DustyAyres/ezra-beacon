import React, { useState, KeyboardEvent } from 'react';
import './AddTask.css';

interface AddTaskProps {
  onAdd: (title: string) => void;
  placeholder?: string;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdd, placeholder = "Add a task" }) => {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle('');
      setIsExpanded(false);
    }
  };

  return (
    <div className={`add-task ${isExpanded ? 'expanded' : ''}`}>
      <button className="add-task-trigger" onClick={() => setIsExpanded(true)}>
        <i className="fas fa-plus add-icon"></i>
        <span>{placeholder}</span>
      </button>
      
      {isExpanded && (
        <div className="add-task-form">
          <input
            type="text"
            className="add-task-input"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            maxLength={255}
            autoFocus
          />
          <div className="add-task-actions">
            <button
              className="tertiary w-button"
              onClick={handleSubmit}
              disabled={!title.trim()}
            >
              Add
            </button>
            <button
              className="secondary-button w-button"
              onClick={() => {
                setTitle('');
                setIsExpanded(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask;
