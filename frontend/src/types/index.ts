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

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  createdAt: string;
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

export interface CreateCategoryDto {
  name: string;
  colorHex: string;
}

export interface UpdateCategoryDto {
  name?: string;
  colorHex?: string;
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

// Application constants
export const APP_LIMITS = {
  MAX_STEPS_PER_TASK: 100,
  MAX_TASK_TITLE_LENGTH: 255,
  MAX_STEP_TITLE_LENGTH: 255,
  MAX_CATEGORY_NAME_LENGTH: 100,
} as const;
