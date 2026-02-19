// User Roles
export type UserRole = 'administrator' | 'manager' | 'coordinator' | 'facilitator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  avatar?: string;
}

// Training Needs
export type TrainingSource = 'FCP Selected Interventions from FPP' | 'GMC/Regional Training Needs' | 'National Office Mandatory Trainings';

export interface TrainingNeed {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  needDescription: string;
  source: TrainingSource;
  dateIdentified: string;
  status: 'identified' | 'addressed' | 'in-progress';
}

// Training Types
export type TrainingType = 'In-Person' | 'Virtual/Zoom' | 'Blended' | 'Forchildren.Com';

export interface TrainingObjective {
  id: string;
  statement: string;
  trainingType: TrainingType;
  expectedDuration: number; // hours
}

// Training Plan
export type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TrainingPlan {
  id: string;
  title: string;
  objectives: string;
  methodologies: string;
  teamMembers: string[];
  startDate: string;
  endDate: string;
  status: PlanStatus;
  region: string;
  trainingType: TrainingType;
  participantCount: number;
  createdBy: string;
  createdAt: string;
  version: number;
}

// Training Materials
export type MaterialFormat = 'Presentation' | 'Handout' | 'Video' | 'Interactive Activity';
export type MaterialStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TrainingMaterial {
  id: string;
  trainingPlanId: string;
  title: string;
  format: MaterialFormat;
  filePath: string;
  fileSize: string;
  status: MaterialStatus;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

// Facilities
export type FacilityType = 'Hotel Facility' | 'Online Platform';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  capacity: number;
  equipment: string[];
  region: string;
  isAvailable: boolean;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  trainingPlanId: string;
  startDate: string;
  endDate: string;
  bookedBy: string;
}

// Training Sessions
export interface TrainingSession {
  id: string;
  trainingPlanId: string;
  trainingName: string;
  facilityId: string;
  facilityName: string;
  date: string;
  format: 'In-Person' | 'Virtual';
  participants: string[];
  facilitatorId: string;
  facilitatorName: string;
  topics: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

// Attendance
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  date: string;
  status: AttendanceStatus;
  synced: boolean;
  notes?: string;
}

// Evaluation
export interface EvaluationRecord {
  id: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  scores: {
    participation: number;
    comprehension: number;
    practicalApplication: number;
    overallPerformance: number;
  };
  notes: string;
  synced: boolean;
  evaluatedAt: string;
}

// Feedback
export interface FeedbackRecord {
  id: string;
  sessionId: string;
  participantId?: string;
  isAnonymous: boolean;
  ratings: {
    contentQuality: number;
    facilitatorEffectiveness: number;
    materialsUsefulness: number;
    venueComfort: number;
    overallSatisfaction: number;
  };
  comments: string;
  synced: boolean;
  submittedAt: string;
}

// KPI
export interface KPIDefinition {
  id: string;
  trainingPlanId: string;
  name: string;
  target: number;
  unit: string;
  measurementInterval: '1 month' | '3 months' | '6 months';
}

export interface KPIMeasurement {
  id: string;
  kpiDefinitionId: string;
  participantId: string;
  date: string;
  value: number;
  notes?: string;
}

// Participants
export interface Participant {
  id: string;
  name: string;
  email: string;
  region: string;
  role: string;
  organization: string;
  trainingsAttended: number;
  averageScore: number;
}

// Staff
export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regions: string[];
  specializations: string[];
  isAvailable: boolean;
}

// Reports
export type ReportType = 'completion' | 'attendance' | 'performance' | 'feedback' | 'calendar';

export interface ReportConfig {
  type: ReportType;
  title: string;
  dateRange: { start: string; end: string };
  regions: string[];
  format: 'excel' | 'word' | 'pdf';
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: number;
}

// Registration System
export interface RegistrationLink {
  id: string;
  trainingSessionId: string;
  token: string;
  isActive: boolean;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantRegistration {
  id: string;
  registrationLinkId: string;
  trainingSessionId: string;
  participantName: string;
  mobileNumber: string;
  emailAddress: string;
  participantPosition: string;
  fcpNumber: string;
  fcpName: string;
  cluster: string;
  region: string;
  attendingWithBaby: boolean;
  nannyApprovalDocument?: string;
  waiverDocument?: string;
  attendanceConfirmed: boolean;
  registrationReference: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocument {
  id: string;
  registrationId: string;
  documentType: 'nanny_approval' | 'waiver_liability';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface LinkAnalytics {
  linkId: string;
  totalViews: number;
  uniqueViews: number;
  totalRegistrations: number;
  conversionRate: number;
  lastAccessed: string;
}
