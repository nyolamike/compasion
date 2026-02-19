-- ============================================
-- BASE SCHEMA FOR TRAINING MANAGEMENT SYSTEM
-- ============================================
-- This file creates all the base tables required for the system
-- Run this BEFORE running 001_registration_system.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('administrator', 'manager', 'coordinator', 'facilitator')),
  regions TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  trainings_attended INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_region ON participants(region);

-- ============================================
-- TRAINING NEEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  need_description TEXT NOT NULL,
  source VARCHAR(255) NOT NULL,
  date_identified DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('identified', 'in-progress', 'addressed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_needs_participant ON training_needs(participant_id);
CREATE INDEX IF NOT EXISTS idx_training_needs_status ON training_needs(status);

-- ============================================
-- TRAINING PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  objectives TEXT NOT NULL,
  methodologies TEXT NOT NULL,
  team_members TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  region VARCHAR(255) NOT NULL,
  training_type VARCHAR(50) NOT NULL CHECK (training_type IN ('In-Person', 'Virtual/Zoom', 'Blended', 'Forchildren.Com')),
  participant_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_plans_status ON training_plans(status);
CREATE INDEX IF NOT EXISTS idx_training_plans_region ON training_plans(region);
CREATE INDEX IF NOT EXISTS idx_training_plans_created_by ON training_plans(created_by);

-- ============================================
-- TRAINING MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  format VARCHAR(50) NOT NULL CHECK (format IN ('Presentation', 'Handout', 'Video', 'Interactive Activity')),
  file_path TEXT NOT NULL,
  file_size VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_materials_plan ON training_materials(training_plan_id);

-- ============================================
-- FACILITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Hotel Facility', 'Online Platform')),
  capacity INTEGER NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  region VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_region ON facilities(region);
CREATE INDEX IF NOT EXISTS idx_facilities_available ON facilities(is_available);

-- ============================================
-- TRAINING SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  training_name VARCHAR(255) NOT NULL,
  facility_id UUID NOT NULL REFERENCES facilities(id),
  facility_name VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  format VARCHAR(50) NOT NULL CHECK (format IN ('In-Person', 'Virtual')),
  participants TEXT[] DEFAULT '{}',
  facilitator_id UUID NOT NULL REFERENCES users(id),
  facilitator_name VARCHAR(255) NOT NULL,
  topics TEXT[] DEFAULT '{}',
  status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_plan ON training_sessions(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);

-- ============================================
-- ATTENDANCE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  synced BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, participant_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant ON attendance_records(participant_id);

-- ============================================
-- EVALUATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participation_score INTEGER CHECK (participation_score BETWEEN 0 AND 100),
  comprehension_score INTEGER CHECK (comprehension_score BETWEEN 0 AND 100),
  practical_application_score INTEGER CHECK (practical_application_score BETWEEN 0 AND 100),
  overall_performance_score INTEGER CHECK (overall_performance_score BETWEEN 0 AND 100),
  notes TEXT,
  synced BOOLEAN DEFAULT false,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_session ON evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_participant ON evaluations(participant_id);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT false,
  content_quality INTEGER CHECK (content_quality BETWEEN 1 AND 5),
  facilitator_effectiveness INTEGER CHECK (facilitator_effectiveness BETWEEN 1 AND 5),
  materials_usefulness INTEGER CHECK (materials_usefulness BETWEEN 1 AND 5),
  venue_comfort INTEGER CHECK (venue_comfort BETWEEN 1 AND 5),
  overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5),
  comments TEXT,
  synced BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback(session_id);

-- ============================================
-- OFFLINE SYNC QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(255) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(50) NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  data JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON offline_sync_queue(synced);

-- ============================================
-- SURVEY TABLES
-- ============================================

-- Survey Templates
CREATE TABLE IF NOT EXISTS survey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_type VARCHAR(50) NOT NULL CHECK (survey_type IN ('pre_training', 'post_training', 'follow_up_3m', 'follow_up_6m')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Questions
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_template_id UUID NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('rating', 'text', 'multiple_choice', 'yes_no', 'scale_1_10')),
  options TEXT[] DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL,
  category VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Schedules
CREATE TABLE IF NOT EXISTS survey_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_template_id UUID NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
  training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  follow_up_type VARCHAR(50) NOT NULL CHECK (follow_up_type IN ('immediate', '1_month', '3_months', '6_months')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  assigned_to UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_template_id UUID NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
  survey_schedule_id UUID REFERENCES survey_schedules(id) ON DELETE SET NULL,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  total_score INTEGER,
  max_possible_score INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_needs_updated_at BEFORE UPDATE ON training_needs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_materials_updated_at BEFORE UPDATE ON training_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_survey_templates_updated_at BEFORE UPDATE ON survey_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_survey_schedules_updated_at BEFORE UPDATE ON survey_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_survey_responses_updated_at BEFORE UPDATE ON survey_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert a test user (facilitator)
INSERT INTO users (name, email, role, regions, specializations) 
VALUES 
  ('Test Facilitator', 'facilitator@test.com', 'facilitator', ARRAY['North', 'South'], ARRAY['Child Protection', 'Training'])
ON CONFLICT (email) DO NOTHING;

-- Insert a test facility
INSERT INTO facilities (name, type, capacity, equipment, region) 
VALUES 
  ('Test Training Center', 'Hotel Facility', 50, ARRAY['Projector', 'Whiteboard', 'WiFi'], 'North')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'System users with different roles (administrator, manager, coordinator, facilitator)';
COMMENT ON TABLE participants IS 'Training participants who attend sessions';
COMMENT ON TABLE training_needs IS 'Identified training needs for participants';
COMMENT ON TABLE training_plans IS 'Training plans created by facilitators';
COMMENT ON TABLE training_materials IS 'Materials associated with training plans';
COMMENT ON TABLE facilities IS 'Physical and virtual training facilities';
COMMENT ON TABLE training_sessions IS 'Individual training sessions scheduled for specific dates';
COMMENT ON TABLE attendance_records IS 'Attendance tracking for participants in sessions';
COMMENT ON TABLE evaluations IS 'Performance evaluations for participants';
COMMENT ON TABLE feedback IS 'Feedback from participants about training sessions';
COMMENT ON TABLE offline_sync_queue IS 'Queue for syncing offline data when connection is restored';
COMMENT ON TABLE survey_templates IS 'Templates for pre/post training surveys';
COMMENT ON TABLE survey_questions IS 'Questions within survey templates';
COMMENT ON TABLE survey_schedules IS 'Scheduled surveys for follow-up assessments';
COMMENT ON TABLE survey_responses IS 'Participant responses to surveys';
