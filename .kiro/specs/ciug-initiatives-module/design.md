# Design Document: CIUG Initiatives Module

## Overview

The CIUG Initiatives Module is a new feature for the Bespoke Training Management App that enables CIUG National Office staff to manage initiatives through a structured 4-stage project lifecycle. This design document specifies the technical implementation approach for the requirements defined in requirements.md.

### Purpose

This module provides a systematic way to track initiatives from planning through closure, with clear task assignments using the RACI (Responsible, Accountable, Consulted, Informed) framework. The implementation focuses on delivering a functional demo for the March 24, 2026 All Staff Engagement Week presentation.

### Scope

This design covers:
- Database schema for initiatives, stages, and tasks
- React components for the user interface
- Integration with existing Supabase backend
- Navigation integration with the existing sidebar
- CRUD operations for initiatives and tasks

Out of scope (deferred to phase 2):
- Email reminders and notifications
- Visual dashboards and analytics
- Advanced reporting features
- Mobile-specific optimizations

### Key Design Decisions

1. **Database Structure**: Use a normalized relational schema with three tables (initiatives, stages, tasks) to maintain data integrity and support efficient queries
2. **Stage Management**: Pre-populate all four stages (PLAN, IMPLEMENT, EVALUATE, CLOSE) at initiative creation time to simplify the UI and ensure consistency
3. **UI Pattern**: Follow existing app patterns using shadcn/ui components, Card layouts, and the established DatabaseService pattern
4. **RACI Fields**: Store RACI assignments as text fields to allow flexibility in naming (can be enhanced with user lookups in phase 2)
5. **Single-Page View**: Display all four stages on one page with collapsible sections for better overview and navigation

## Architecture

### System Context

The CIUG Initiatives Module integrates into the existing Bespoke Training Management App as a new top-level feature accessible from the sidebar navigation. It follows the established architectural patterns:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App.tsx (Router)                                       │ │
│  │    └─ Index.tsx (Main Layout)                          │ │
│  │         ├─ Sidebar.tsx (Navigation)                    │ │
│  │         └─ AppContext (State Management)               │ │
│  │              └─ InitiativesView (NEW)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend (PostgreSQL)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database Tables:                                       │ │
│  │    - initiatives (NEW)                                 │ │
│  │    - initiative_stages (NEW)                           │ │
│  │    - initiative_tasks (NEW)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
InitiativesView
├─ InitiativesList (sidebar/list view)
│  ├─ Button (Create New Initiative)
│  └─ InitiativeListItem[] (clickable list items)
│
└─ InitiativeDetail (main content area)
   ├─ InitiativeHeader (title, metadata)
   ├─ StageSection[] (4 stages)
   │  ├─ StageHeader (stage name, add task button)
   │  └─ TaskTable
   │     ├─ Table (shadcn/ui)
   │     └─ TaskRow[]
   │        ├─ Task name
   │        ├─ Comment
   │        └─ RACI fields (R, A, C, I)
   │
   └─ CreateInitiativeDialog (modal form)
```

### Data Flow

1. **Initiative Creation**:
   - User clicks "Create Initiative" → Dialog opens
   - User enters initiative name → Submit
   - Frontend calls `db.createInitiative()` → Creates initiative record
   - Frontend calls `db.createInitiativeStages()` → Creates 4 stage records
   - UI refreshes to show new initiative

2. **Task Addition**:
   - User selects stage → Clicks "Add Task"
   - Inline form appears in table
   - User fills task details + RACI fields → Submit
   - Frontend calls `db.createInitiativeTask()` → Creates task record
   - Table updates to show new task

3. **Data Loading**:
   - Component mounts → Calls `db.getInitiatives()`
   - User selects initiative → Calls `db.getInitiativeWithStagesAndTasks(initiativeId)`
   - Data populates the UI with all stages and tasks

## Components and Interfaces

### Database Service Extensions

Extend `src/lib/database.ts` with new methods following the established pattern:

```typescript
// New type definitions
export interface DbInitiative {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbInitiativeStage {
  id: string;
  initiative_id: string;
  stage_name: 'PLAN' | 'IMPLEMENT' | 'EVALUATE' | 'CLOSE';
  stage_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbInitiativeTask {
  id: string;
  stage_id: string;
  task_name: string;
  comment: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  created_at: string;
  updated_at: string;
}

// New methods in DatabaseService class
async getInitiatives(): Promise<DbInitiative[]>
async getInitiativeById(id: string): Promise<DbInitiative | null>
async createInitiative(initiative: Omit<DbInitiative, 'id' | 'created_at' | 'updated_at'>): Promise<DbInitiative>
async updateInitiative(id: string, updates: Partial<DbInitiative>): Promise<DbInitiative>
async deleteInitiative(id: string): Promise<void>

async getStagesByInitiativeId(initiativeId: string): Promise<DbInitiativeStage[]>
async createInitiativeStage(stage: Omit<DbInitiativeStage, 'id' | 'created_at' | 'updated_at'>): Promise<DbInitiativeStage>

async getTasksByStageId(stageId: string): Promise<DbInitiativeTask[]>
async createInitiativeTask(task: Omit<DbInitiativeTask, 'id' | 'created_at' | 'updated_at'>): Promise<DbInitiativeTask>
async updateInitiativeTask(id: string, updates: Partial<DbInitiativeTask>): Promise<DbInitiativeTask>
async deleteInitiativeTask(id: string): Promise<void>

// Convenience method for loading complete initiative data
async getInitiativeWithStagesAndTasks(initiativeId: string): Promise<{
  initiative: DbInitiative;
  stages: Array<DbInitiativeStage & { tasks: DbInitiativeTask[] }>;
}>
```

### React Components

#### InitiativesView Component

Main container component that manages state and layout.

**Props**: None (uses AppContext for user data)

**State**:
- `initiatives: DbInitiative[]` - List of all initiatives
- `selectedInitiativeId: string | null` - Currently selected initiative
- `initiativeData: { initiative, stages } | null` - Full data for selected initiative
- `isCreateDialogOpen: boolean` - Controls create dialog visibility
- `isLoading: boolean` - Loading state

**Key Methods**:
- `loadInitiatives()` - Fetch all initiatives
- `loadInitiativeDetail(id)` - Fetch full initiative data
- `handleCreateInitiative(name)` - Create new initiative with stages
- `handleAddTask(stageId, taskData)` - Add task to stage

#### InitiativesList Component

Displays list of initiatives with create button.

**Props**:
- `initiatives: DbInitiative[]`
- `selectedId: string | null`
- `onSelect: (id: string) => void`
- `onCreateClick: () => void`

**Renders**:
- Header with "Create Initiative" button
- Scrollable list of initiative items
- Empty state when no initiatives exist

#### InitiativeDetail Component

Displays full initiative with all stages and tasks.

**Props**:
- `initiative: DbInitiative`
- `stages: Array<DbInitiativeStage & { tasks: DbInitiativeTask[] }>`
- `onAddTask: (stageId: string, taskData: TaskFormData) => void`
- `onUpdateTask: (taskId: string, updates: Partial<DbInitiativeTask>) => void`
- `onDeleteTask: (taskId: string) => void`

**Renders**:
- Initiative header with name and metadata
- Four stage sections (Accordion or Card components)
- Each stage contains a TaskTable component

#### StageSection Component

Displays one stage with its tasks.

**Props**:
- `stage: DbInitiativeStage`
- `tasks: DbInitiativeTask[]`
- `onAddTask: (taskData: TaskFormData) => void`

**Renders**:
- Stage header with name and "Add Task" button
- TaskTable with all tasks for this stage
- Inline task creation form (when adding)

#### TaskTable Component

Table displaying tasks with RACI columns.

**Props**:
- `tasks: DbInitiativeTask[]`
- `onUpdate: (taskId: string, updates: Partial<DbInitiativeTask>) => void`
- `onDelete: (taskId: string) => void`

**Columns**:
- Task (task_name)
- Comment
- Responsible
- Accountable
- Consulted
- Informed
- Actions (edit/delete icons)

#### CreateInitiativeDialog Component

Modal dialog for creating new initiatives.

**Props**:
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `onSubmit: (name: string) => void`

**Form Fields**:
- Initiative Name (required text input)

### Navigation Integration

Update `src/components/Sidebar.tsx` to include the new navigation item:

```typescript
const navItems: NavItem[] = [
  // ... existing items ...
  { 
    id: 'initiatives', 
    label: 'CIUG Initiatives', 
    icon: <TargetIcon size={20} />, 
    roles: ['administrator', 'manager', 'coordinator'] 
  },
  // ... rest of items ...
];
```

Update `src/pages/Index.tsx` to handle the new view:

```typescript
// Add to view rendering logic
{currentView === 'initiatives' && <InitiativesView />}
```

## Data Models

### Database Schema

#### initiatives table

```sql
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_initiatives_created_at ON initiatives(created_at DESC);
```

**Columns**:
- `id`: Unique identifier (UUID)
- `name`: Initiative name (required)
- `created_by`: User identifier who created the initiative
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

#### initiative_stages table

```sql
CREATE TABLE initiative_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL CHECK (stage_name IN ('PLAN', 'IMPLEMENT', 'EVALUATE', 'CLOSE')),
  stage_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, stage_name)
);

CREATE INDEX idx_initiative_stages_initiative_id ON initiative_stages(initiative_id);
CREATE INDEX idx_initiative_stages_order ON initiative_stages(initiative_id, stage_order);
```

**Columns**:
- `id`: Unique identifier (UUID)
- `initiative_id`: Foreign key to initiatives table
- `stage_name`: One of 'PLAN', 'IMPLEMENT', 'EVALUATE', 'CLOSE'
- `stage_order`: Integer (1-4) for ordering stages
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

**Constraints**:
- CASCADE delete when initiative is deleted
- UNIQUE constraint on (initiative_id, stage_name) to prevent duplicates

#### initiative_tasks table

```sql
CREATE TABLE initiative_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES initiative_stages(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  comment TEXT DEFAULT '',
  responsible TEXT DEFAULT '',
  accountable TEXT DEFAULT '',
  consulted TEXT DEFAULT '',
  informed TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_initiative_tasks_stage_id ON initiative_tasks(stage_id);
CREATE INDEX idx_initiative_tasks_created_at ON initiative_tasks(created_at);
```

**Columns**:
- `id`: Unique identifier (UUID)
- `stage_id`: Foreign key to initiative_stages table
- `task_name`: Task description (required)
- `comment`: Additional task details
- `responsible`: Person/role responsible for execution
- `accountable`: Person/role accountable for completion
- `consulted`: Person/role to be consulted
- `informed`: Person/role to be informed
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

**Constraints**:
- CASCADE delete when stage is deleted

### TypeScript Interfaces

The interfaces defined in the Components and Interfaces section provide type safety for the frontend application. These interfaces map directly to the database schema with appropriate TypeScript types.

### Data Relationships

```
initiatives (1) ──< (many) initiative_stages
                              │
                              │ (1)
                              │
                              ▼
                           (many) initiative_tasks
```

- One initiative has exactly four stages
- Each stage can have zero or many tasks
- Deleting an initiative cascades to delete all stages and tasks
- Deleting a stage cascades to delete all its tasks


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Stage structure properties (2.1-2.5)** can be combined into a single comprehensive property that verifies all four stages exist with correct names and order
2. **Task field capture properties (3.3, 3.4, 4.1-4.4)** can be consolidated into one property that verifies all task fields are captured
3. **Referential integrity properties (5.4, 5.5)** are implicitly tested by the persistence and retrieval properties
4. **UI rendering examples (7.1, 7.2, 7.4, 7.5)** are specific examples rather than universal properties

The following properties represent the minimal set needed for comprehensive validation:

### Property 1: Initiative Creation Captures Required Metadata

*For any* valid initiative name and user identifier, when an initiative is created, the system should persist a record with the provided name, the user identifier, and a valid creation timestamp.

**Validates: Requirements 1.2, 1.4, 1.5**

### Property 2: Initiative Creation Initializes Four-Stage Lifecycle

*For any* newly created initiative, the system should automatically create exactly four stages with names 'PLAN', 'IMPLEMENT', 'EVALUATE', and 'CLOSE' in sequential order (stage_order 1, 2, 3, 4).

**Validates: Requirements 1.3, 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 3: Task Creation Captures All Fields

*For any* task added to a stage with a task name, comment, and RACI assignments (responsible, accountable, consulted, informed), the system should persist all provided field values.

**Validates: Requirements 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.6**

### Property 4: Multiple Tasks Per Stage

*For any* stage, the system should allow adding multiple tasks, and all added tasks should be retrievable for that stage.

**Validates: Requirements 3.1, 3.2**

### Property 5: Initiative Persistence Round-Trip

*For any* initiative created with a given name, retrieving that initiative from the database should return an initiative with the same name and associated metadata.

**Validates: Requirements 5.1**

### Property 6: Task Persistence Round-Trip

*For any* task created with specific field values, retrieving that task from the database should return a task with the same field values.

**Validates: Requirements 5.2**

### Property 7: Initiative Retrieval Includes All Tasks Organized By Stage

*For any* initiative with tasks distributed across its stages, retrieving the initiative should return all tasks correctly associated with their respective stages in the proper stage order.

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 8: Stage Display Ordering

*For any* initiative, when rendering the stages, they should appear in sequential order: PLAN, IMPLEMENT, EVALUATE, CLOSE.

**Validates: Requirements 2.6**

### Property 9: Task Display Completeness

*For any* stage containing tasks, rendering that stage should display all tasks associated with that stage.

**Validates: Requirements 7.3**

### Property 10: Initiative List Completeness

*For any* set of created initiatives, the initiatives list view should display all initiatives with their names.

**Validates: Requirements 8.1, 8.2**

### Property 11: Initiative Selection Loads Complete Data

*For any* initiative selected from the list, the system should load and display the complete initiative data including all four stages and all associated tasks.

**Validates: Requirements 8.3**

## Error Handling

### Database Errors

**Connection Failures**:
- Wrap all database calls in try-catch blocks
- Display user-friendly error messages using toast notifications
- Log detailed errors to console for debugging
- Provide retry mechanisms for transient failures

**Constraint Violations**:
- Unique constraint violations (duplicate stage names): Should not occur due to application logic, but handle gracefully if database state is inconsistent
- Foreign key violations: Prevent by validating parent records exist before creating child records
- NOT NULL violations: Validate required fields in the UI before submission

**Cascade Deletes**:
- When deleting an initiative, confirm with user that all stages and tasks will be deleted
- Use database CASCADE constraints to ensure referential integrity
- Show success message indicating what was deleted

### Validation Errors

**Initiative Creation**:
- Initiative name is required (non-empty string)
- Initiative name should have reasonable length limits (e.g., 1-200 characters)
- Display validation errors inline in the form

**Task Creation**:
- Task name is required (non-empty string)
- RACI fields are optional but should accept text input
- Comment field is optional
- Display validation errors inline in the form

### Network Errors

**Offline Handling**:
- Detect network connectivity issues
- Display clear message when offline
- Disable create/edit actions when offline
- Consider implementing offline queue for future enhancement

**Timeout Handling**:
- Set reasonable timeouts for database operations (e.g., 10 seconds)
- Show loading indicators during operations
- Allow user to cancel long-running operations

### UI Error States

**Empty States**:
- No initiatives: Show friendly message with "Create Initiative" call-to-action
- No tasks in stage: Show empty table with column headers and "Add Task" button
- Failed to load data: Show error message with "Retry" button

**Loading States**:
- Show skeleton loaders while fetching data
- Disable action buttons during operations to prevent duplicate submissions
- Show progress indicators for multi-step operations

### Error Recovery

**Partial Failures**:
- If initiative is created but stages fail to create, attempt to rollback or complete the operation
- Log partial failures for investigation
- Provide clear feedback to user about what succeeded and what failed

**Data Inconsistency**:
- If an initiative has fewer than 4 stages, provide admin function to repair
- Validate data integrity on load and flag issues
- Provide clear error messages if data is in unexpected state

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and UI component behavior
**Property Tests**: Verify universal properties across randomized inputs

### Property-Based Testing

**Framework**: Use `fast-check` library for TypeScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with format: `Feature: ciug-initiatives-module, Property {number}: {property_text}`

**Property Test Implementation**:

Each correctness property defined above should be implemented as a property-based test:

1. **Property 1 Test**: Generate random initiative names and user IDs, create initiatives, verify all fields are persisted correctly
2. **Property 2 Test**: Generate random initiatives, verify exactly 4 stages are created with correct names and order
3. **Property 3 Test**: Generate random task data with all fields, create tasks, verify all fields are persisted
4. **Property 4 Test**: Generate random number of tasks (2-10), add to same stage, verify all are retrievable
5. **Property 5 Test**: Generate random initiative data, create and retrieve, verify round-trip preserves data
6. **Property 6 Test**: Generate random task data, create and retrieve, verify round-trip preserves data
7. **Property 7 Test**: Generate random initiative with tasks across stages, retrieve, verify all tasks are correctly associated
8. **Property 8 Test**: Generate random initiative, render stages, verify order is PLAN → IMPLEMENT → EVALUATE → CLOSE
9. **Property 9 Test**: Generate random tasks for a stage, render stage, verify all tasks appear
10. **Property 10 Test**: Generate random set of initiatives, render list, verify all appear with names
11. **Property 11 Test**: Generate random initiative with full data, select from list, verify complete data loads

**Generators**:
- `arbitraryInitiativeName()`: Generate valid initiative names (1-200 chars, non-empty)
- `arbitraryUserId()`: Generate valid user identifiers
- `arbitraryTaskData()`: Generate complete task objects with all RACI fields
- `arbitraryStageId()`: Generate valid stage identifiers
- `arbitraryInitiativeWithTasks()`: Generate complete initiative with stages and tasks

### Unit Testing

**Component Tests**:
- InitiativesView: Test initial render, loading states, error states
- InitiativesList: Test empty state, list rendering, selection behavior
- InitiativeDetail: Test stage rendering, task display
- StageSection: Test add task button, task table rendering
- TaskTable: Test column headers, empty state, task row rendering
- CreateInitiativeDialog: Test form validation, submission, cancellation

**Database Service Tests**:
- Test each CRUD method with specific examples
- Test error handling for invalid inputs
- Test cascade delete behavior
- Test transaction rollback scenarios

**Integration Tests**:
- Test complete flow: create initiative → add tasks → retrieve → display
- Test navigation integration: sidebar click → view loads
- Test error scenarios: network failure, validation errors

**Edge Cases**:
- Empty initiative name (should be rejected)
- Very long initiative name (should be truncated or rejected)
- Special characters in names (should be handled correctly)
- Concurrent task additions to same stage
- Deleting initiative while viewing it

### Test Data

**Seed Data**:
- Create sample initiatives for manual testing
- Include initiatives with varying numbers of tasks
- Include empty initiatives (no tasks)
- Include initiatives with tasks in all stages

**Test Isolation**:
- Use separate test database or test schema
- Clean up test data after each test run
- Use transactions for test isolation where possible

### Coverage Goals

- **Line Coverage**: Minimum 80% for all new code
- **Branch Coverage**: Minimum 75% for conditional logic
- **Property Coverage**: 100% of correctness properties implemented as tests
- **Component Coverage**: All React components have basic render tests

### Testing Tools

- **Unit Testing**: Vitest (existing project standard)
- **Property Testing**: fast-check
- **Component Testing**: React Testing Library
- **E2E Testing**: (Deferred to phase 2) Playwright or Cypress

### Continuous Integration

- Run all tests on every commit
- Block merges if tests fail
- Generate coverage reports
- Run property tests with increased iterations (1000+) in CI environment

