# Feature Specification: CIUG Initiatives Module

## Overview

This document describes the requirements for a new **"CIUG Initiatives"** module to be added to the existing Bespoke Training Management App developed for Compassion International Uganda (CIUG). The module is intended to help the national office manage initiatives end-to-end across a structured 4-stage project lifecycle.

---

## Background & Context

- **Requested by:** Irene Omara (IOmara@ug.ci.org), CIUG National Office
- **Cc'd stakeholders:** John Male (JMale@ug.ci.org), Brenda Abeja (BAbeja@ug.ci.org)
- **Developer contact:** Ronnie Sinini (rsinini@cu.ac.ug)
- **Request date:** March 12, 2026
- **Demo deadline:** March 24, 2026 (All Staff Engagement Week presentation to National Office)
- **Scope note:** A basic demo is required for the March 24 presentation. Full refinement will occur in a subsequent phase aligned with the upcoming "user case & process definition" phase.

---

## Core Functional Requirements

### 1. Create New Initiative

- Users must be able to create a new initiative by providing at minimum a **Name** field.
- The initiative serves as the parent container for all tasks across the 4 stages below.

```
+ Create new initiative
  Name: [text input]
```

---

### 2. Four-Stage Project Lifecycle

Each initiative must progress through exactly **4 stages** in order:

| # | Stage | Description |
|---|-------|-------------|
| 1 | **PLAN** | Planning phase — define tasks before execution |
| 2 | **IMPLEMENT** | Execution phase — carry out planned tasks |
| 3 | **EVALUATE** | Assessment phase — review outcomes |
| 4 | **CLOSE** | Closure phase — formally close the initiative |

---

### 3. Task Management (Per Stage)

Each stage must support adding multiple tasks. Each task must capture the following fields:

| Field | Description |
|-------|-------------|
| **Task** | Name or title of the task |
| **Comment** | Detail, notes, or description of the task |
| **Responsible** | Person(s) who carry out the task |
| **Accountable** | Person ultimately answerable for the task (RACI) |
| **Consulted** | Person(s) whose input is sought |
| **Informed** | Person(s) kept up to date on progress |

> **Note:** This follows the standard **RACI matrix** framework (Responsible, Accountable, Consulted, Informed).

UI pattern per stage:
```
[STAGE NAME]
+ Add task
| TASK | COMMENT | RESPONSIBLE | ACCOUNTABLE | CONSULTED | INFORMED |
| ---- | ------- | ----------- | ----------- | --------- | -------- |
| ...  | ...     | ...         | ...         | ...       | ...      |
```

---

### 4. Email Reminder Notifications *(Nice-to-have / Phase 2)*

- The system should be able to **trigger automated email reminders** to individuals assigned in the RACI fields (Responsible, Accountable, Consulted, Informed) when task due dates approach or are reached.
- This is noted as highly desirable for driving task traction but is flagged as a future-phase feature if not feasible for the demo.

---

### 5. Visual Progress Summary *(Nice-to-have / Phase 2)*

- A **visual dashboard or progress indicator** per initiative showing completion status across the 4 stages would be a valuable addition.
- Could be implemented as a progress bar, Kanban-style board, or stage-completion percentage.

---

## UI/UX Notes

- The interface should allow users to **add tasks dynamically** within each stage (i.e., rows are not fixed — users click `+ Add task` to insert new rows).
- The 4 stages should be displayed **sequentially** on the same initiative page/view.
- The demo version requires at minimum:
  - `+ Create new initiative` with a Name field
  - All 4 stages (PLAN, IMPLEMENT, EVALUATE, CLOSE) each with `+ Add task` and the RACI task table

---

## Out of Scope (for Demo)

The following are explicitly deferred to a later refinement phase:
- Email reminder automation
- Visual progress summary / dashboard
- Full RACI user lookup / integration with staff database
- Approval workflows for initiatives

---

## Suggested Data Model

```
Initiative
├── id
├── name
├── created_at
├── created_by
└── stages[]
    ├── stage_name  (PLAN | IMPLEMENT | EVALUATE | CLOSE)
    └── tasks[]
        ├── id
        ├── task_name
        ├── comment
        ├── responsible   (user reference or free text)
        ├── accountable   (user reference or free text)
        ├── consulted     (user reference or free text)
        ├── informed      (user reference or free text)
        └── due_date      (optional, for reminder triggers)
```

---

## Integration Notes

- This module should be integrated into the existing **Training Management App** as a distinct top-level navigation section labelled **"CIUG Initiatives"**.
- It is independent of the training workflow but may share the same user/staff database for RACI field lookups in future phases.
- The module was confirmed by the developer (Sinini) to align with the upcoming **"user case & process definition"** project phase, which will precede the System Test phase.

---

## Source Reference

Extracted from email thread: *"Re: Bespoke Training Management App: Process & Requirements Alignment"*
Date range: January 7, 2026 – March 15, 2026
Parties: Compassion International Uganda ↔ Sinini (cu.ac.ug)
