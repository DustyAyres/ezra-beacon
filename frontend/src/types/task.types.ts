// Task-related types that are shared across features
export interface TaskCounts {
  myDay: number;
  important: number;
  planned: number;
  all: number;
}

export type TaskView = 'myday' | 'important' | 'planned' | 'tasks';
export type SortBy = 'importance' | 'duedate' | 'alphabetically' | 'creationdate';
export type ViewMode = 'list' | 'grid';
