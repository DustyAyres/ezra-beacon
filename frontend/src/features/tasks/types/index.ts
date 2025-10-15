import { Category } from '../../categories/types';

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

export enum RecurrenceType {
  None = 0,
  Daily = 1,
  Weekdays = 2,
  Weekly = 3,
  Monthly = 4,
  Yearly = 5,
  Custom = 6
}

export interface CreateTaskDto {
  title: string;
  dueDate?: string;
  isImportant: boolean;
  recurrenceType?: RecurrenceType;
  customRecurrencePattern?: string;
  categoryId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  dueDate?: string;
  isImportant?: boolean;
  isCompleted?: boolean;
  recurrenceType?: RecurrenceType;
  customRecurrencePattern?: string;
  categoryId?: string;
}

export interface CreateStepDto {
  title: string;
}

export interface UpdateStepDto {
  title?: string;
  isCompleted?: boolean;
}

export interface TaskCounts {
  myDay: number;
  important: number;
  planned: number;
  all: number;
}

export type TaskView = 'myday' | 'important' | 'planned' | 'tasks';
export type SortBy = 'importance' | 'duedate' | 'alphabetically' | 'creationdate';
export type ViewMode = 'list' | 'grid';
