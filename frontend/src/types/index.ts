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
  None = "None",
  Daily = "Daily",
  Weekdays = "Weekdays",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
  Custom = "Custom"
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

export type TaskView = 'myday' | 'important' | 'planned' | 'tasks';
export type SortBy = 'importance' | 'duedate' | 'alphabetically' | 'creationdate';
export type ViewMode = 'list' | 'grid';
