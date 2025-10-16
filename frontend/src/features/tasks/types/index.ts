import { Category } from '../../categories/types';
import { RecurrenceType } from '../../../types/api.types';

// Task domain model
export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  isImportant: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  recurrenceType?: RecurrenceType;
  customRecurrencePattern?: string;
  categoryId?: string;
  category?: Category;
  steps: TaskStep[];
}

export interface TaskStep {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}
