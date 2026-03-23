# Requirements Document

## Introduction

The CIUG Initiatives Module is a new feature for the Bespoke Training Management App that enables Compassion International Uganda (CIUG) National Office staff to manage initiatives through a structured 4-stage project lifecycle: PLAN → IMPLEMENT → EVALUATE → CLOSE. Each initiative contains tasks organized by stage, with RACI matrix assignments to clarify roles and responsibilities.

This is a demo version targeting the March 24, 2026 All Staff Engagement Week presentation. Advanced features such as email reminders and visual dashboards are deferred to phase 2.

## Glossary

- **Initiative**: A project managed through the 4-stage lifecycle (PLAN, IMPLEMENT, EVALUATE, CLOSE)
- **Stage**: One of four sequential phases in the initiative lifecycle
- **Task**: A work item within a stage that includes RACI role assignments
- **RACI_Matrix**: A responsibility assignment framework defining Responsible, Accountable, Consulted, and Informed roles
- **Initiatives_Module**: The system component that manages initiatives and their tasks
- **User**: A CIUG National Office staff member who creates and manages initiatives
- **Navigation_System**: The top-level menu structure of the Training Management App

## Requirements

### Requirement 1: Initiative Creation

**User Story:** As a CIUG National Office staff member, I want to create new initiatives with a descriptive name, so that I can begin managing a project through the 4-stage lifecycle.

#### Acceptance Criteria

1. THE Initiatives_Module SHALL provide a create initiative interface
2. WHEN a User provides an initiative name, THE Initiatives_Module SHALL create a new initiative with that name
3. WHEN an initiative is created, THE Initiatives_Module SHALL initialize all four stages (PLAN, IMPLEMENT, EVALUATE, CLOSE) for that initiative
4. WHEN an initiative is created, THE Initiatives_Module SHALL record the creation timestamp
5. WHEN an initiative is created, THE Initiatives_Module SHALL record the creating User identifier

### Requirement 2: Four-Stage Lifecycle Structure

**User Story:** As a CIUG National Office staff member, I want each initiative to follow a structured 4-stage lifecycle, so that projects progress through consistent planning, execution, evaluation, and closure phases.

#### Acceptance Criteria

1. THE Initiatives_Module SHALL organize each initiative into exactly four stages
2. THE Initiatives_Module SHALL label the first stage as PLAN
3. THE Initiatives_Module SHALL label the second stage as IMPLEMENT
4. THE Initiatives_Module SHALL label the third stage as EVALUATE
5. THE Initiatives_Module SHALL label the fourth stage as CLOSE
6. THE Initiatives_Module SHALL display all four stages in sequential order on the same page

### Requirement 3: Task Management Within Stages

**User Story:** As a CIUG National Office staff member, I want to add multiple tasks to each stage with detailed information, so that I can track specific work items and their assignments.

#### Acceptance Criteria

1. THE Initiatives_Module SHALL allow Users to add tasks to any stage
2. THE Initiatives_Module SHALL allow multiple tasks per stage
3. WHEN a User adds a task, THE Initiatives_Module SHALL capture a task name
4. WHEN a User adds a task, THE Initiatives_Module SHALL capture a comment field for task details
5. THE Initiatives_Module SHALL provide dynamic task addition within each stage
6. WHEN a User requests to add a task, THE Initiatives_Module SHALL display an interface to input task details

### Requirement 4: RACI Matrix Role Assignment

**User Story:** As a CIUG National Office staff member, I want to assign RACI roles to each task, so that everyone knows who is responsible, accountable, consulted, and informed for each work item.

#### Acceptance Criteria

1. WHEN a User adds a task, THE Initiatives_Module SHALL capture the Responsible role assignment
2. WHEN a User adds a task, THE Initiatives_Module SHALL capture the Accountable role assignment
3. WHEN a User adds a task, THE Initiatives_Module SHALL capture the Consulted role assignment
4. WHEN a User adds a task, THE Initiatives_Module SHALL capture the Informed role assignment
5. THE Initiatives_Module SHALL display all RACI fields (Responsible, Accountable, Consulted, Informed) for each task
6. THE Initiatives_Module SHALL accept text input for each RACI role field

### Requirement 5: Task Data Persistence

**User Story:** As a CIUG National Office staff member, I want all initiative and task data to be saved reliably, so that I can access and update my initiatives over time.

#### Acceptance Criteria

1. WHEN a User creates an initiative, THE Initiatives_Module SHALL persist the initiative data to the database
2. WHEN a User adds a task, THE Initiatives_Module SHALL persist the task data to the database
3. WHEN a User views an initiative, THE Initiatives_Module SHALL retrieve all associated tasks organized by stage
4. THE Initiatives_Module SHALL maintain the association between tasks and their parent stage
5. THE Initiatives_Module SHALL maintain the association between stages and their parent initiative

### Requirement 6: Navigation Integration

**User Story:** As a CIUG National Office staff member, I want to access the Initiatives module from the main navigation menu, so that I can easily find and use the feature.

#### Acceptance Criteria

1. THE Navigation_System SHALL include a top-level menu item labeled "CIUG Initiatives"
2. WHEN a User selects the "CIUG Initiatives" menu item, THE Navigation_System SHALL display the Initiatives_Module interface
3. THE Navigation_System SHALL display the "CIUG Initiatives" menu item alongside existing navigation sections

### Requirement 7: Task Display and Organization

**User Story:** As a CIUG National Office staff member, I want to see all tasks organized by stage in a clear table format, so that I can quickly review task assignments and details.

#### Acceptance Criteria

1. THE Initiatives_Module SHALL display tasks in a tabular format within each stage
2. THE Initiatives_Module SHALL display columns for Task, Comment, Responsible, Accountable, Consulted, and Informed
3. WHEN a stage contains tasks, THE Initiatives_Module SHALL display all tasks for that stage
4. WHEN a stage contains no tasks, THE Initiatives_Module SHALL display an empty task table with column headers
5. THE Initiatives_Module SHALL display stage names as section headers above their respective task tables

### Requirement 8: Initiative Listing

**User Story:** As a CIUG National Office staff member, I want to view a list of all initiatives, so that I can select which initiative to work on.

#### Acceptance Criteria

1. THE Initiatives_Module SHALL display a list of all created initiatives
2. THE Initiatives_Module SHALL display the initiative name for each initiative in the list
3. WHEN a User selects an initiative from the list, THE Initiatives_Module SHALL display the full initiative view with all stages and tasks
4. WHEN no initiatives exist, THE Initiatives_Module SHALL display an empty state with the option to create a new initiative
