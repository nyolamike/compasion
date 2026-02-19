# Requirements Document

## Introduction

The Participant Self-Registration feature enables trainers to generate shareable registration links for specific training sessions. Participants can use these links to self-register, providing their details and confirming attendance. This feature streamlines the registration process, reduces administrative overhead, and improves attendance tracking for annual reporting purposes.

## Requirements

### Requirement 1

**User Story:** As a trainer, I want to generate a unique registration link for a specific training session, so that I can easily share it with potential participants for self-registration.

#### Acceptance Criteria

1. WHEN a trainer selects a training session THEN the system SHALL generate a unique, secure registration link
2. WHEN a trainer clicks "Generate Registration Link" THEN the system SHALL create a shareable URL that includes the training session details
3. WHEN a registration link is generated THEN the system SHALL display the link with copy-to-clipboard functionality
4. WHEN a trainer generates a link THEN the system SHALL store the link association with the training session in the database
5. IF a registration link already exists for a training session THEN the system SHALL display the existing link instead of creating a new one

### Requirement 2

**User Story:** As a participant, I want to access a registration form through a shared link, so that I can register for a training session without needing system access.

#### Acceptance Criteria

1. WHEN a participant clicks a registration link THEN the system SHALL display a public registration form
2. WHEN the registration form loads THEN the system SHALL display the training session details (name, date, location, type)
3. IF the training is in-person THEN the system SHALL display implications and requirements for attendance
4. WHEN a participant accesses an invalid or expired link THEN the system SHALL display an appropriate error message
5. WHEN a participant accesses a link for a past training THEN the system SHALL prevent registration and display a message

### Requirement 3

**User Story:** As a participant, I want to provide my personal and professional details during registration, so that the system has accurate information for attendance tracking and reporting.

#### Acceptance Criteria

1. WHEN a participant fills the registration form THEN the system SHALL require participant name, mobile number, and email address
2. WHEN a participant submits the form THEN the system SHALL validate email format and mobile number format
3. WHEN a participant registers THEN the system SHALL require participant position, FCP number, FCP name, cluster, and region
4. WHEN a participant provides duplicate email or mobile number THEN the system SHALL prevent duplicate registrations for the same training
5. IF a participant has already registered for the training THEN the system SHALL display their existing registration details

### Requirement 4

**User Story:** As a participant with a baby under 1 year old, I want to indicate my childcare needs and upload required documentation, so that I can attend the training with proper approvals.

#### Acceptance Criteria

1. WHEN a participant accesses the registration form THEN the system SHALL ask "Are you attending with a baby under 1 year old?"
2. IF a participant selects "Yes" for baby attendance THEN the system SHALL require upload of nanny approval and waiver of liability forms
3. WHEN a participant uploads documents THEN the system SHALL validate file types (PDF, JPG, PNG) and size limits (max 5MB per file)
4. WHEN required documents are uploaded THEN the system SHALL store them securely and associate them with the registration
5. IF a participant selects "Yes" but doesn't upload required documents THEN the system SHALL prevent form submission

### Requirement 5

**User Story:** As a participant, I want to confirm my attendance commitment, so that trainers have accurate headcount and I understand the implications of my commitment.

#### Acceptance Criteria

1. WHEN a participant completes the registration form THEN the system SHALL require explicit attendance confirmation
2. WHEN a participant confirms attendance THEN the system SHALL display the implications of confirming attendance for in-person training
3. WHEN a participant submits the registration THEN the system SHALL send a confirmation email with training details and next steps
4. WHEN registration is successful THEN the system SHALL display a success message with registration reference number
5. WHEN a participant confirms attendance THEN the system SHALL update the training session participant count

### Requirement 6

**User Story:** As a trainer, I want to view and manage participant registrations for my training sessions, so that I can track attendance and prepare accordingly.

#### Acceptance Criteria

1. WHEN a trainer views a training session THEN the system SHALL display the count of registered participants
2. WHEN a trainer clicks on participant count THEN the system SHALL show a list of all registered participants with their details
3. WHEN a trainer views participant details THEN the system SHALL show registration timestamp and any uploaded documents
4. WHEN a trainer needs to contact participants THEN the system SHALL provide export functionality for participant contact information
5. IF participants have uploaded baby-related documents THEN the system SHALL clearly indicate this in the participant list

### Requirement 7

**User Story:** As an administrator, I want to generate reports on participant attendance across training sessions, so that I can analyze training participation patterns for the year.

#### Acceptance Criteria

1. WHEN an administrator accesses the reports section THEN the system SHALL provide a "Participant Registration Report" option
2. WHEN generating a registration report THEN the system SHALL allow filtering by date range, training type, region, and cluster
3. WHEN a report is generated THEN the system SHALL include participant details, training information, and registration timestamps
4. WHEN exporting reports THEN the system SHALL support CSV and PDF formats
5. WHEN viewing annual reports THEN the system SHALL show participant attendance trends and training completion rates

### Requirement 8

**User Story:** As a system administrator, I want registration links to have security measures and expiration controls, so that the system remains secure and links don't remain active indefinitely.

#### Acceptance Criteria

1. WHEN a registration link is generated THEN the system SHALL include a secure token that cannot be easily guessed
2. WHEN a training session date passes THEN the system SHALL automatically disable the registration link
3. WHEN a trainer sets registration deadlines THEN the system SHALL enforce these deadlines and disable links accordingly
4. WHEN suspicious activity is detected on a registration link THEN the system SHALL log the activity for review
5. IF a registration link is accessed too frequently THEN the system SHALL implement rate limiting to prevent abuse