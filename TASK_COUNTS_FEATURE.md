# Task Counts Feature Implementation

## Overview
This feature adds real-time task counts to the sidebar navigation in Ezra Beacon, allowing users to see at a glance how many tasks they have in each view.

## Implementation Details

### Backend Changes

1. **New API Endpoint** (`/api/tasks/counts`)
   - Added to `TasksController.cs`
   - Returns counts for:
     - My Day: Tasks with due date = today
     - Important: Tasks marked as important
     - Planned: Tasks with any due date
     - All: Total task count
   - Only counts non-completed tasks

2. **DTO Added**
   - `TaskCountsDto` with properties: `MyDay`, `Important`, `Planned`, `All`

### Frontend Changes

1. **Type Definition** (`types/index.ts`)
   - Added `TaskCounts` interface matching the backend DTO

2. **API Service** (`services/api.ts`)
   - Added `getTaskCounts()` method to fetch counts from the API

3. **App Component** (`App.tsx`)
   - Added `taskCounts` state
   - Added `loadTaskCounts()` function
   - Fetches counts on authentication
   - Passes counts and refresh function to Layout

4. **Layout Component** (`Layout.tsx`)
   - Accepts `taskCounts` and `onTaskCountsChange` props
   - Passes counts to Sidebar component

5. **Sidebar Component** (`Sidebar.tsx`)
   - Accepts `taskCounts` prop
   - Displays counts next to each navigation item
   - Shows count only when > 0

6. **Task View Components** (MyDayView, ImportantView, PlannedView, TasksView)
   - Accept `onTaskChange` prop
   - Call `onTaskChange` after create/update/delete operations
   - This triggers count refresh in the App component

### Visual Design

- Counts appear on the right side of each navigation item
- Styled with:
  - Small font size (12px)
  - Background color matching the app theme
  - Rounded corners (border-radius: 12px)
  - Secondary text color
  - Only visible when count > 0

## Testing

1. The counts update automatically when:
   - Creating a new task
   - Updating task properties (completion, importance, due date)
   - Deleting tasks

2. Test HTML page created (`test-task-counts.html`) to verify API endpoint

## Usage

The feature works automatically once deployed. Users will see:
- "My Day" with count of today's tasks
- "Important" with count of starred tasks
- "Planned" with count of all tasks with due dates
- "Tasks" with total task count

Counts refresh in real-time as users interact with tasks.
