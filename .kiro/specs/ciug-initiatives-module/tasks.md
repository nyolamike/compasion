# Implementation Plan: CIUG Initiatives Module

## Overview

This implementation plan breaks down the CIUG Initiatives Module into discrete coding tasks. The module enables CIUG National Office staff to manage initiatives through a 4-stage lifecycle (PLAN → IMPLEMENT → EVALUATE → CLOSE) with RACI-based task assignments.

The implementation follows the existing app architecture using React, TypeScript, Supabase, and shadcn/ui components. Tasks are organized to build incrementally, validating core functionality early through code.

## Tasks

- [x] 1. Set up database schema and migrations
  - Create SQL migration file for three new tables: initiatives, initiative_stages, initiative_tasks
  - Define table structures with proper constraints, indexes, and CASCADE delete rules
  - Include CHECK constraint for stage_name enum values
  - Add UNIQUE constraint on (initiative_id, stage_name) to prevent duplicate stages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.4, 5.5_

- [ ] 2. Extend DatabaseService with initiatives data access methods
  - [x] 2.1 Add TypeScript interfaces for database models
    - Define DbInitiative, DbInitiativeStage, DbInitiativeTask interfaces
    - Export interfaces from database.ts
    - _Requirements: 1.2, 1.4, 1.5, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 2.2 Implement initiative CRUD methods
    - Add getInitiatives(), getInitiativeById(), createInitiative(), updateInitiative(), deleteInitiative()
    - Follow existing DatabaseService patterns with error handling
    - _Requirements: 1.1, 1.2, 5.1, 8.1, 8.2_
  
  - [x] 2.3 Implement stage data access methods
    - Add getStagesByInitiativeId(), createInitiativeStage()
    - Include stage_order in queries for proper ordering
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 5.4_
  
  - [x] 2.4 Implement task CRUD methods
    - Add getTasksByStageId(), createInitiativeTask(), updateInitiativeTask(), deleteInitiativeTask()
    - Handle all RACI fields in create and update operations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.2, 5.5_
  
  - [x] 2.5 Implement convenience method for loading complete initiative data
    - Add getInitiativeWithStagesAndTasks(initiativeId) that returns nested structure
    - Join stages and tasks in proper order
    - _Requirements: 5.3, 5.4, 5.5, 8.3_
  
  - [ ]* 2.6 Write property test for initiative creation metadata
    - **Property 1: Initiative Creation Captures Required Metadata**
    - **Validates: Requirements 1.2, 1.4, 1.5**
  
  - [ ]* 2.7 Write property test for four-stage lifecycle initialization
    - **Property 2: Initiative Creation Initializes Four-Stage Lifecycle**
    - **Validates: Requirements 1.3, 2.1, 2.2, 2.3, 2.4, 2.5**
  
  - [ ]* 2.8 Write property test for task field capture
    - **Property 3: Task Creation Captures All Fields**
    - **Validates: Requirements 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.6**
  
  - [ ]* 2.9 Write property test for multiple tasks per stage
    - **Property 4: Multiple Tasks Per Stage**
    - **Validates: Requirements 3.1, 3.2**

- [ ] 3. Checkpoint - Verify database layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create InitiativesView main container component
  - [x] 4.1 Create InitiativesView component with state management
    - Set up component file at src/components/InitiativesView.tsx
    - Define state for initiatives list, selected initiative, loading states
    - Implement loadInitiatives() and loadInitiativeDetail() methods
    - Use AppContext for user data access
    - _Requirements: 1.1, 8.1, 8.3_
  
  - [x] 4.2 Implement initiative creation handler
    - Add handleCreateInitiative(name) method that creates initiative and four stages
    - Call db.createInitiative() followed by four db.createInitiativeStage() calls
    - Handle errors and show toast notifications
    - Refresh initiatives list after creation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 4.3 Implement task management handlers
    - Add handleAddTask(stageId, taskData) method
    - Add handleUpdateTask(taskId, updates) method
    - Add handleDeleteTask(taskId) method
    - Include error handling and UI feedback
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 4.4 Implement layout with two-column structure
    - Left column: InitiativesList component
    - Right column: InitiativeDetail component (conditional on selection)
    - Use existing app layout patterns
    - _Requirements: 8.1, 8.3_
  
  - [ ]* 4.5 Write property test for initiative persistence round-trip
    - **Property 5: Initiative Persistence Round-Trip**
    - **Validates: Requirements 5.1**
  
  - [ ]* 4.6 Write property test for task persistence round-trip
    - **Property 6: Task Persistence Round-Trip**
    - **Validates: Requirements 5.2**

- [ ] 5. Create InitiativesList component
  - [x] 5.1 Implement InitiativesList component
    - Create component file at src/components/InitiativesList.tsx
    - Display scrollable list of initiative items
    - Add "Create Initiative" button at top
    - Highlight selected initiative
    - Show empty state when no initiatives exist
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [ ]* 5.2 Write property test for initiative list completeness
    - **Property 10: Initiative List Completeness**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 6. Create CreateInitiativeDialog component
  - [x] 6.1 Implement CreateInitiativeDialog modal
    - Create component file at src/components/CreateInitiativeDialog.tsx
    - Use shadcn/ui Dialog component
    - Add form with initiative name input field
    - Implement validation (required, 1-200 characters)
    - Handle form submission and cancellation
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 6.2 Write unit tests for dialog validation
    - Test empty name rejection
    - Test very long name handling
    - Test form submission and cancellation

- [ ] 7. Create InitiativeDetail component
  - [x] 7.1 Implement InitiativeDetail component
    - Create component file at src/components/InitiativeDetail.tsx
    - Display initiative header with name and metadata
    - Render four StageSection components in order
    - Pass task management handlers to child components
    - _Requirements: 2.6, 8.3_
  
  - [ ]* 7.2 Write property test for initiative retrieval with tasks
    - **Property 7: Initiative Retrieval Includes All Tasks Organized By Stage**
    - **Validates: Requirements 5.3, 5.4, 5.5**
  
  - [ ]* 7.3 Write property test for initiative selection loading
    - **Property 11: Initiative Selection Loads Complete Data**
    - **Validates: Requirements 8.3**

- [ ] 8. Create StageSection component
  - [x] 8.1 Implement StageSection component
    - Create component file at src/components/StageSection.tsx
    - Display stage name as section header
    - Add "Add Task" button
    - Render TaskTable component with stage's tasks
    - Implement inline task creation form (toggle on "Add Task" click)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.6, 7.5_
  
  - [ ]* 8.2 Write property test for stage display ordering
    - **Property 8: Stage Display Ordering**
    - **Validates: Requirements 2.6**

- [ ] 9. Create TaskTable component
  - [x] 9.1 Implement TaskTable component
    - Create component file at src/components/TaskTable.tsx
    - Use shadcn/ui Table component
    - Define columns: Task, Comment, Responsible, Accountable, Consulted, Informed, Actions
    - Render task rows with all fields
    - Add edit and delete action buttons
    - Show empty table with headers when no tasks exist
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 9.2 Write property test for task display completeness
    - **Property 9: Task Display Completeness**
    - **Validates: Requirements 7.3**
  
  - [ ]* 9.3 Write unit tests for TaskTable
    - Test empty state rendering
    - Test task row rendering with all fields
    - Test edit and delete button interactions

- [ ] 10. Checkpoint - Verify component integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Integrate InitiativesView into navigation
  - [x] 11.1 Update Sidebar component with CIUG Initiatives menu item
    - Add new nav item to src/components/Sidebar.tsx
    - Use appropriate icon (Target or similar)
    - Set roles: administrator, manager, coordinator
    - _Requirements: 6.1, 6.3_
  
  - [x] 11.2 Update Index page to render InitiativesView
    - Add route handling in src/pages/Index.tsx
    - Render InitiativesView when currentView === 'initiatives'
    - _Requirements: 6.2_
  
  - [ ]* 11.3 Write integration test for navigation flow
    - Test sidebar click navigates to initiatives view
    - Test view loads and displays correctly

- [ ] 12. Implement error handling and loading states
  - [x] 12.1 Add error boundaries and error handling
    - Wrap database calls in try-catch blocks
    - Display user-friendly error messages with toast notifications
    - Log errors to console for debugging
    - Add retry mechanisms for failed operations
    - _Requirements: All requirements (error handling is cross-cutting)_
  
  - [x] 12.2 Add loading indicators
    - Show skeleton loaders while fetching data
    - Disable action buttons during operations
    - Show progress indicators for multi-step operations
    - _Requirements: All requirements (loading states are cross-cutting)_
  
  - [ ]* 12.3 Write unit tests for error scenarios
    - Test network failure handling
    - Test validation error display
    - Test empty state rendering

- [ ] 13. Add form validation and user feedback
  - [x] 13.1 Implement client-side validation
    - Validate initiative name (required, length limits)
    - Validate task name (required)
    - Display inline validation errors
    - Prevent submission of invalid forms
    - _Requirements: 1.2, 3.3_
  
  - [x] 13.2 Add success feedback
    - Show toast notifications for successful operations
    - Update UI immediately after operations
    - Provide clear confirmation messages
    - _Requirements: All requirements (user feedback is cross-cutting)_

- [ ] 14. Final checkpoint and integration testing
  - [x] 14.1 Test complete user flows
    - Test: Create initiative → Add tasks to all stages → View initiative
    - Test: Create multiple initiatives → Select different initiatives
    - Test: Edit task → Delete task
    - Test: Delete initiative (with confirmation)
    - _Requirements: All requirements_
  
  - [x] 14.2 Verify all requirements are met
    - Review each acceptance criterion against implementation
    - Test edge cases and error scenarios
    - Verify UI matches design specifications
    - _Requirements: All requirements_
  
  - [ ]* 14.3 Run full property test suite
    - Execute all 11 property tests with 100+ iterations
    - Verify no failures or edge cases discovered
    - Document any issues found

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows existing app patterns (DatabaseService, shadcn/ui, AppContext)
- Database migrations should be run before implementing data access methods
- Components build incrementally: data layer → container → list/detail → sub-components
- Navigation integration happens after core functionality is complete
