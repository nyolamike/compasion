import {
  TrainingPlan,
  TrainingNeed,
  TrainingMaterial,
  Facility,
  TrainingSession,
  Participant,
  Staff,
  AttendanceRecord,
  EvaluationRecord,
  FeedbackRecord,
} from '@/types';

// Uganda Regions
export const regions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
];

// Staff Members
export const staffMembers: Staff[] = [
  { id: 'staff-1', name: 'Sarah Nakamya', email: 'sarah.n@org.ug', role: 'coordinator', regions: ['Central Region', 'Kampala'], specializations: ['Child Protection', 'Leadership'], isAvailable: true },
  { id: 'staff-2', name: 'James Okello', email: 'james.o@org.ug', role: 'facilitator', regions: ['Northern Region'], specializations: ['Health & Nutrition', 'Community Development'], isAvailable: true },
  { id: 'staff-3', name: 'Grace Namugga', email: 'grace.n@org.ug', role: 'manager', regions: ['Central Region', 'Eastern Region', 'Northern Region', 'Western Region', 'Kampala'], specializations: ['Program Management'], isAvailable: true },
  { id: 'staff-4', name: 'Peter Wasswa', email: 'peter.w@org.ug', role: 'facilitator', regions: ['Eastern Region'], specializations: ['Education', 'Youth Empowerment'], isAvailable: true },
  { id: 'staff-5', name: 'Mary Achieng', email: 'mary.a@org.ug', role: 'coordinator', regions: ['Western Region'], specializations: ['Financial Literacy', 'Livelihood'], isAvailable: false },
  { id: 'staff-6', name: 'David Mugisha', email: 'david.m@org.ug', role: 'facilitator', regions: ['Central Region'], specializations: ['Child Protection', 'Counseling'], isAvailable: true },
  { id: 'staff-7', name: 'Rebecca Atim', email: 'rebecca.a@org.ug', role: 'administrator', regions: ['Central Region', 'Eastern Region', 'Northern Region', 'Western Region', 'Kampala'], specializations: ['System Administration'], isAvailable: true },
  { id: 'staff-8', name: 'Joseph Kato', email: 'joseph.k@org.ug', role: 'facilitator', regions: ['Kampala', 'Central Region'], specializations: ['Leadership', 'Team Building'], isAvailable: true },
];

// Participants
export const participants: Participant[] = [
  { id: 'part-1', name: 'Agnes Namutebi', email: 'agnes.n@fcp.ug', region: 'Central Region', role: 'FCP Coordinator', organization: 'Hope Church FCP', trainingsAttended: 5, averageScore: 87 },
  { id: 'part-2', name: 'Robert Ochieng', email: 'robert.o@fcp.ug', region: 'Northern Region', role: 'Youth Leader', organization: 'Grace Community FCP', trainingsAttended: 3, averageScore: 92 },
  { id: 'part-3', name: 'Florence Akello', email: 'florence.a@fcp.ug', region: 'Eastern Region', role: 'Health Worker', organization: 'Sunrise FCP', trainingsAttended: 7, averageScore: 78 },
  { id: 'part-4', name: 'Samuel Tumusiime', email: 'samuel.t@fcp.ug', region: 'Western Region', role: 'Education Officer', organization: 'New Life FCP', trainingsAttended: 4, averageScore: 85 },
  { id: 'part-5', name: 'Esther Nakato', email: 'esther.n@fcp.ug', region: 'Kampala', role: 'Child Protection Officer', organization: 'City Light FCP', trainingsAttended: 6, averageScore: 91 },
  { id: 'part-6', name: 'John Ssempijja', email: 'john.s@fcp.ug', region: 'Central Region', role: 'Program Manager', organization: 'Faith Community FCP', trainingsAttended: 8, averageScore: 89 },
  { id: 'part-7', name: 'Catherine Apio', email: 'catherine.a@fcp.ug', region: 'Northern Region', role: 'Social Worker', organization: 'Peace FCP', trainingsAttended: 2, averageScore: 76 },
  { id: 'part-8', name: 'Michael Byaruhanga', email: 'michael.b@fcp.ug', region: 'Western Region', role: 'Finance Officer', organization: 'Mountain View FCP', trainingsAttended: 5, averageScore: 83 },
  { id: 'part-9', name: 'Dorothy Nambi', email: 'dorothy.n@fcp.ug', region: 'Eastern Region', role: 'Volunteer Coordinator', organization: 'Riverside FCP', trainingsAttended: 4, averageScore: 88 },
  { id: 'part-10', name: 'Patrick Odongo', email: 'patrick.o@fcp.ug', region: 'Northern Region', role: 'Community Leader', organization: 'Unity FCP', trainingsAttended: 6, averageScore: 80 },
  { id: 'part-11', name: 'Joyce Nalwanga', email: 'joyce.n@fcp.ug', region: 'Kampala', role: 'Health Educator', organization: 'Urban Hope FCP', trainingsAttended: 3, averageScore: 94 },
  { id: 'part-12', name: 'Emmanuel Kiiza', email: 'emmanuel.k@fcp.ug', region: 'Central Region', role: 'Youth Mentor', organization: 'Bright Future FCP', trainingsAttended: 5, averageScore: 86 },
];

// Training Needs
export const trainingNeeds: TrainingNeed[] = [
  { id: 'need-1', participantId: 'part-1', participantName: 'Agnes Namutebi', participantEmail: 'agnes.n@fcp.ug', needDescription: 'Advanced child protection protocols and reporting mechanisms', source: 'FCP Selected Interventions from FPP', dateIdentified: '2026-01-10', status: 'in-progress' },
  { id: 'need-2', participantId: 'part-2', participantName: 'Robert Ochieng', participantEmail: 'robert.o@fcp.ug', needDescription: 'Youth leadership and mentorship skills development', source: 'GMC/Regional Training Needs', dateIdentified: '2026-01-12', status: 'identified' },
  { id: 'need-3', participantId: 'part-3', participantName: 'Florence Akello', participantEmail: 'florence.a@fcp.ug', needDescription: 'Health and nutrition assessment techniques', source: 'National Office Mandatory Trainings', dateIdentified: '2026-01-08', status: 'addressed' },
  { id: 'need-4', participantId: 'part-4', participantName: 'Samuel Tumusiime', participantEmail: 'samuel.t@fcp.ug', needDescription: 'Educational program monitoring and evaluation', source: 'FCP Selected Interventions from FPP', dateIdentified: '2026-01-15', status: 'identified' },
  { id: 'need-5', participantId: 'part-5', participantName: 'Esther Nakato', participantEmail: 'esther.n@fcp.ug', needDescription: 'Trauma-informed care approaches', source: 'GMC/Regional Training Needs', dateIdentified: '2026-01-18', status: 'in-progress' },
  { id: 'need-6', participantId: 'part-6', participantName: 'John Ssempijja', participantEmail: 'john.s@fcp.ug', needDescription: 'Financial management and budgeting for FCPs', source: 'National Office Mandatory Trainings', dateIdentified: '2026-01-05', status: 'addressed' },
];

// Facilities
export const facilities: Facility[] = [
  { id: 'fac-1', name: 'Kampala Conference Center', type: 'Hotel Facility', capacity: 100, equipment: ['Projector', 'Sound System', 'Whiteboard', 'WiFi'], region: 'Kampala', isAvailable: true },
  { id: 'fac-2', name: 'Jinja Training Hall', type: 'Hotel Facility', capacity: 80, equipment: ['Projector', 'Whiteboard', 'WiFi'], region: 'Eastern Region', isAvailable: true },
  { id: 'fac-3', name: 'Gulu Community Center', type: 'Hotel Facility', capacity: 60, equipment: ['Projector', 'Sound System'], region: 'Northern Region', isAvailable: false },
  { id: 'fac-4', name: 'Mbarara Training Facility', type: 'Hotel Facility', capacity: 75, equipment: ['Projector', 'Whiteboard', 'WiFi', 'Video Conferencing'], region: 'Western Region', isAvailable: true },
  { id: 'fac-5', name: 'Zoom Meeting Room', type: 'Online Platform', capacity: 500, equipment: ['Screen Sharing', 'Breakout Rooms', 'Recording'], region: 'Kampala', isAvailable: true },
  { id: 'fac-6', name: 'Microsoft Teams Hub', type: 'Online Platform', capacity: 300, equipment: ['Screen Sharing', 'Whiteboard', 'Recording'], region: 'Kampala', isAvailable: true },
  { id: 'fac-7', name: 'Entebbe Lakeside Resort', type: 'Hotel Facility', capacity: 120, equipment: ['Projector', 'Sound System', 'Whiteboard', 'WiFi', 'Video Conferencing'], region: 'Central Region', isAvailable: true },
  { id: 'fac-8', name: 'Forchildren.Com Platform', type: 'Online Platform', capacity: 1000, equipment: ['Interactive Modules', 'Progress Tracking', 'Certificates'], region: 'Kampala', isAvailable: true },
];

// Training Plans
export const trainingPlans: TrainingPlan[] = [
  {
    id: 'plan-1',
    title: 'Child Protection Fundamentals',
    objectives: 'Equip FCP staff with comprehensive knowledge of child protection policies, reporting mechanisms, and intervention strategies.',
    methodologies: 'Interactive workshops, case studies, role-playing exercises, group discussions',
    teamMembers: ['staff-1', 'staff-6'],
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    status: 'approved',
    region: 'Central Region',
    trainingType: 'In-Person',
    participantCount: 45,
    createdBy: 'staff-1',
    createdAt: '2026-01-15',
    version: 2,
  },
  {
    id: 'plan-2',
    title: 'Youth Leadership Development Program',
    objectives: 'Develop leadership skills among youth mentors to effectively guide and support young people in their communities.',
    methodologies: 'Experiential learning, mentorship sessions, leadership challenges, peer feedback',
    teamMembers: ['staff-2', 'staff-8'],
    startDate: '2026-02-20',
    endDate: '2026-02-22',
    status: 'submitted',
    region: 'Northern Region',
    trainingType: 'In-Person',
    participantCount: 60,
    createdBy: 'staff-2',
    createdAt: '2026-01-18',
    version: 1,
  },
  {
    id: 'plan-3',
    title: 'Health & Nutrition Assessment Training',
    objectives: 'Train health workers on standardized assessment tools and nutrition intervention protocols.',
    methodologies: 'Practical demonstrations, field exercises, assessment simulations',
    teamMembers: ['staff-4'],
    startDate: '2026-03-05',
    endDate: '2026-03-07',
    status: 'draft',
    region: 'Eastern Region',
    trainingType: 'Blended',
    participantCount: 35,
    createdBy: 'staff-4',
    createdAt: '2026-01-20',
    version: 1,
  },
  {
    id: 'plan-4',
    title: 'Financial Literacy for FCP Leaders',
    objectives: 'Enhance financial management capabilities of FCP leaders for better resource stewardship.',
    methodologies: 'Lectures, budgeting exercises, financial planning workshops, case analysis',
    teamMembers: ['staff-5', 'staff-1'],
    startDate: '2026-03-15',
    endDate: '2026-03-16',
    status: 'approved',
    region: 'Western Region',
    trainingType: 'Virtual/Zoom',
    participantCount: 80,
    createdBy: 'staff-5',
    createdAt: '2026-01-10',
    version: 3,
  },
  {
    id: 'plan-5',
    title: 'Trauma-Informed Care Workshop',
    objectives: 'Build capacity in trauma recognition, response, and referral pathways for child welfare workers.',
    methodologies: 'Expert presentations, self-care techniques, trauma response simulations',
    teamMembers: ['staff-6', 'staff-2'],
    startDate: '2026-04-01',
    endDate: '2026-04-03',
    status: 'submitted',
    region: 'Kampala',
    trainingType: 'In-Person',
    participantCount: 55,
    createdBy: 'staff-6',
    createdAt: '2026-01-22',
    version: 1,
  },
  {
    id: 'plan-6',
    title: 'Digital Skills for Program Staff',
    objectives: 'Enhance digital literacy and technology adoption among program staff for improved efficiency.',
    methodologies: 'Hands-on computer training, software tutorials, online collaboration exercises',
    teamMembers: ['staff-8'],
    startDate: '2026-04-15',
    endDate: '2026-04-16',
    status: 'draft',
    region: 'Kampala',
    trainingType: 'Forchildren.Com',
    participantCount: 100,
    createdBy: 'staff-8',
    createdAt: '2026-01-25',
    version: 1,
  },
];

// Training Materials
export const trainingMaterials: TrainingMaterial[] = [
  { id: 'mat-1', trainingPlanId: 'plan-1', title: 'Child Protection Policy Overview', format: 'Presentation', filePath: '/materials/cp-policy.pptx', fileSize: '2.4 MB', status: 'approved', uploadedBy: 'staff-1', uploadedAt: '2026-01-16', version: 2 },
  { id: 'mat-2', trainingPlanId: 'plan-1', title: 'Reporting Mechanisms Handbook', format: 'Handout', filePath: '/materials/reporting-handbook.pdf', fileSize: '1.8 MB', status: 'approved', uploadedBy: 'staff-1', uploadedAt: '2026-01-16', version: 1 },
  { id: 'mat-3', trainingPlanId: 'plan-1', title: 'Case Study Scenarios', format: 'Interactive Activity', filePath: '/materials/case-studies.docx', fileSize: '850 KB', status: 'approved', uploadedBy: 'staff-6', uploadedAt: '2026-01-17', version: 1 },
  { id: 'mat-4', trainingPlanId: 'plan-2', title: 'Leadership Principles Video', format: 'Video', filePath: '/materials/leadership-video.mp4', fileSize: '45 MB', status: 'submitted', uploadedBy: 'staff-2', uploadedAt: '2026-01-19', version: 1 },
  { id: 'mat-5', trainingPlanId: 'plan-2', title: 'Youth Mentorship Guide', format: 'Handout', filePath: '/materials/mentorship-guide.pdf', fileSize: '3.2 MB', status: 'submitted', uploadedBy: 'staff-8', uploadedAt: '2026-01-19', version: 1 },
  { id: 'mat-6', trainingPlanId: 'plan-4', title: 'Budgeting Templates', format: 'Handout', filePath: '/materials/budget-templates.xlsx', fileSize: '520 KB', status: 'approved', uploadedBy: 'staff-5', uploadedAt: '2026-01-12', version: 2 },
  { id: 'mat-7', trainingPlanId: 'plan-4', title: 'Financial Management Slides', format: 'Presentation', filePath: '/materials/finance-slides.pptx', fileSize: '4.1 MB', status: 'approved', uploadedBy: 'staff-5', uploadedAt: '2026-01-12', version: 3 },
  { id: 'mat-8', trainingPlanId: 'plan-3', title: 'Nutrition Assessment Tools', format: 'Handout', filePath: '/materials/nutrition-tools.pdf', fileSize: '2.1 MB', status: 'draft', uploadedBy: 'staff-4', uploadedAt: '2026-01-21', version: 1 },
];

// Training Sessions
export const trainingSessions: TrainingSession[] = [
  {
    id: 'session-1',
    trainingPlanId: 'plan-1',
    trainingName: 'Child Protection Fundamentals - Day 1',
    facilityId: 'fac-7',
    facilityName: 'Entebbe Lakeside Resort',
    date: '2026-02-10',
    format: 'In-Person',
    participants: ['part-1', 'part-5', 'part-6', 'part-12'],
    facilitatorId: 'staff-1',
    facilitatorName: 'Sarah Nakamya',
    topics: ['Introduction', 'Child Protection Policies', 'Identification of Abuse'],
    status: 'scheduled',
  },
  {
    id: 'session-2',
    trainingPlanId: 'plan-1',
    trainingName: 'Child Protection Fundamentals - Day 2',
    facilityId: 'fac-7',
    facilityName: 'Entebbe Lakeside Resort',
    date: '2026-02-11',
    format: 'In-Person',
    participants: ['part-1', 'part-5', 'part-6', 'part-12'],
    facilitatorId: 'staff-6',
    facilitatorName: 'David Mugisha',
    topics: ['Reporting Mechanisms', 'Case Management', 'Documentation'],
    status: 'scheduled',
  },
  {
    id: 'session-3',
    trainingPlanId: 'plan-4',
    trainingName: 'Financial Literacy for FCP Leaders',
    facilityId: 'fac-5',
    facilityName: 'Zoom Meeting Room',
    date: '2026-03-15',
    format: 'Virtual',
    participants: ['part-4', 'part-8', 'part-6'],
    facilitatorId: 'staff-5',
    facilitatorName: 'Mary Achieng',
    topics: ['Budgeting Basics', 'Financial Reporting', 'Resource Management'],
    status: 'scheduled',
  },
];

// Attendance Records
export const attendanceRecords: AttendanceRecord[] = [
  { id: 'att-1', sessionId: 'session-1', participantId: 'part-1', participantName: 'Agnes Namutebi', date: '2026-02-10', status: 'present', synced: true },
  { id: 'att-2', sessionId: 'session-1', participantId: 'part-5', participantName: 'Esther Nakato', date: '2026-02-10', status: 'present', synced: true },
  { id: 'att-3', sessionId: 'session-1', participantId: 'part-6', participantName: 'John Ssempijja', date: '2026-02-10', status: 'late', synced: false },
  { id: 'att-4', sessionId: 'session-1', participantId: 'part-12', participantName: 'Emmanuel Kiiza', date: '2026-02-10', status: 'absent', synced: true },
];

// Evaluation Records
export const evaluationRecords: EvaluationRecord[] = [
  {
    id: 'eval-1',
    sessionId: 'session-1',
    participantId: 'part-1',
    participantName: 'Agnes Namutebi',
    scores: { participation: 90, comprehension: 85, practicalApplication: 88, overallPerformance: 87 },
    notes: 'Excellent engagement and insightful questions during discussions.',
    synced: true,
    evaluatedAt: '2026-02-10',
  },
  {
    id: 'eval-2',
    sessionId: 'session-1',
    participantId: 'part-5',
    participantName: 'Esther Nakato',
    scores: { participation: 95, comprehension: 92, practicalApplication: 90, overallPerformance: 92 },
    notes: 'Outstanding performance. Demonstrated strong understanding of concepts.',
    synced: true,
    evaluatedAt: '2026-02-10',
  },
];

// Feedback Records
export const feedbackRecords: FeedbackRecord[] = [
  {
    id: 'fb-1',
    sessionId: 'session-1',
    participantId: 'part-1',
    isAnonymous: false,
    ratings: { contentQuality: 5, facilitatorEffectiveness: 5, materialsUsefulness: 4, venueComfort: 5, overallSatisfaction: 5 },
    comments: 'Very informative session. The case studies were particularly helpful.',
    synced: true,
    submittedAt: '2026-02-10',
  },
  {
    id: 'fb-2',
    sessionId: 'session-1',
    isAnonymous: true,
    ratings: { contentQuality: 4, facilitatorEffectiveness: 5, materialsUsefulness: 4, venueComfort: 4, overallSatisfaction: 4 },
    comments: 'Good training overall. Would appreciate more time for practical exercises.',
    synced: true,
    submittedAt: '2026-02-10',
  },
];

// Dashboard Statistics
export const dashboardStats = {
  totalTrainings: 60,
  completedTrainings: 42,
  upcomingTrainings: 18,
  totalParticipants: 4200,
  averageAttendance: 94,
  averageSatisfaction: 4.6,
  pendingApprovals: 3,
  activeRegions: 5,
};
