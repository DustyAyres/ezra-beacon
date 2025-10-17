// API Data Transfer Objects (DTOs) and types shared between features and API layer

// Task DTOs
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

// Category DTOs
export interface CreateCategoryDto {
  name: string;
  colorHex: string;
}

export interface UpdateCategoryDto {
  name?: string;
  colorHex?: string;
}

// Enums
export enum RecurrenceType {
  None = 0,
  Daily = 1,
  Weekdays = 2,
  Weekly = 3,
  Monthly = 4,
  Yearly = 5,
  Custom = 6
}
