-- ============================================
-- SEED DATA FOR TRAINING MANAGEMENT SYSTEM
-- ============================================
-- This file creates sample data for testing and development
-- Run this after 000_base_schema.sql and 001_registration_system.sql

-- ============================================
-- USERS (Trainers/Facilitators)
-- ============================================

-- John - Facilitator
INSERT INTO users (id, name, email, role, regions, specializations, is_available) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John Kamau', 'john.kamau@example.com', 'facilitator', 
   ARRAY['Nairobi', 'Central'], ARRAY['Child Protection', 'Safeguarding', 'Training of Trainers'], true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  regions = EXCLUDED.regions,
  specializations = EXCLUDED.specializations;

-- Brenda - Facilitator
INSERT INTO users (id, name, email, role, regions, specializations, is_available) 
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Brenda Wanjiku', 'brenda.wanjiku@example.com', 'facilitator', 
   ARRAY['Nairobi', 'Coast'], ARRAY['Child Development', 'Nutrition', 'Health & Safety'], true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  regions = EXCLUDED.regions,
  specializations = EXCLUDED.specializations;

-- Additional users for variety
INSERT INTO users (id, name, email, role, regions, specializations, is_available) 
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'David Omondi', 'david.omondi@example.com', 'coordinator', 
   ARRAY['Nairobi', 'Western'], ARRAY['Program Management', 'Monitoring & Evaluation'], true),
  ('44444444-4444-4444-4444-444444444444', 'Sarah Njeri', 'sarah.njeri@example.com', 'manager', 
   ARRAY['Nairobi'], ARRAY['Strategic Planning', 'Resource Management'], true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FACILITIES
-- ============================================

INSERT INTO facilities (id, name, type, capacity, equipment, region, is_available) 
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nairobi Training Center', 'Hotel Facility', 50, 
   ARRAY['Projector', 'Whiteboard', 'WiFi', 'Sound System', 'Flip Charts'], 'Nairobi', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mombasa Conference Hall', 'Hotel Facility', 80, 
   ARRAY['Projector', 'WiFi', 'Air Conditioning', 'Microphones'], 'Coast', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Zoom Virtual Platform', 'Online Platform', 200, 
   ARRAY['Screen Sharing', 'Breakout Rooms', 'Recording', 'Chat'], 'Virtual', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Kisumu Training Hall', 'Hotel Facility', 40, 
   ARRAY['Projector', 'Whiteboard', 'WiFi'], 'Western', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- PARTICIPANTS
-- ============================================

INSERT INTO participants (id, name, email, region, role, organization, trainings_attended, average_score) 
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Mary Akinyi', 'mary.akinyi@fcp.org', 'Nairobi', 'FCP Coordinator', 'FCP Nairobi North', 3, 85.5),
  ('a2222222-2222-2222-2222-222222222222', 'Peter Mwangi', 'peter.mwangi@fcp.org', 'Central', 'Program Officer', 'FCP Central Region', 5, 92.0),
  ('a3333333-3333-3333-3333-333333333333', 'Grace Wambui', 'grace.wambui@fcp.org', 'Coast', 'Field Officer', 'FCP Mombasa', 2, 78.5),
  ('a4444444-4444-4444-4444-444444444444', 'James Otieno', 'james.otieno@fcp.org', 'Western', 'FCP Manager', 'FCP Kisumu', 7, 88.0),
  ('a5555555-5555-5555-5555-555555555555', 'Lucy Njoki', 'lucy.njoki@fcp.org', 'Nairobi', 'Social Worker', 'FCP Nairobi South', 4, 90.5)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRAINING PLANS
-- ============================================

-- Training Plan 1 - Child Protection (by John)
INSERT INTO training_plans (id, title, objectives, methodologies, team_members, start_date, end_date, status, region, training_type, participant_count, created_by, version) 
VALUES 
  ('ba111111-1111-1111-1111-111111111111', 
   'Child Protection and Safeguarding Training',
   'To equip FCP staff with comprehensive knowledge and skills in child protection, safeguarding policies, and reporting mechanisms.',
   'Interactive workshops, case studies, role-playing exercises, group discussions, and practical assessments.',
   ARRAY['John Kamau', 'David Omondi'],
   CURRENT_DATE + INTERVAL '7 days',
   CURRENT_DATE + INTERVAL '12 days',
   'approved',
   'Nairobi',
   'In-Person',
   25,
   '11111111-1111-1111-1111-111111111111',
   1)
ON CONFLICT DO NOTHING;

-- Training Plan 2 - Nutrition (by Brenda)
INSERT INTO training_plans (id, title, objectives, methodologies, team_members, start_date, end_date, status, region, training_type, participant_count, created_by, version) 
VALUES 
  ('ba222222-2222-2222-2222-222222222222', 
   'Child Nutrition and Health Training',
   'To train FCP staff on proper nutrition practices, health monitoring, and early childhood development milestones.',
   'Hands-on demonstrations, nutritional assessments, health screening practices, and interactive sessions.',
   ARRAY['Brenda Wanjiku', 'Sarah Njeri'],
   CURRENT_DATE + INTERVAL '14 days',
   CURRENT_DATE + INTERVAL '19 days',
   'approved',
   'Coast',
   'In-Person',
   30,
   '22222222-2222-2222-2222-222222222222',
   1)
ON CONFLICT DO NOTHING;

-- Training Plan 3 - Virtual Training (by John)
INSERT INTO training_plans (id, title, objectives, methodologies, team_members, start_date, end_date, status, region, training_type, participant_count, created_by, version) 
VALUES 
  ('ba333333-3333-3333-3333-333333333333', 
   'Monitoring and Evaluation for FCP Programs',
   'To enhance M&E skills for tracking program outcomes, data collection, and reporting.',
   'Virtual presentations, online quizzes, breakout room discussions, and practical exercises.',
   ARRAY['John Kamau'],
   CURRENT_DATE + INTERVAL '21 days',
   CURRENT_DATE + INTERVAL '23 days',
   'approved',
   'Virtual',
   'Virtual/Zoom',
   50,
   '11111111-1111-1111-1111-111111111111',
   1)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRAINING SESSIONS
-- ============================================

-- Session 1 - Child Protection (John's session)
INSERT INTO training_sessions (id, training_plan_id, training_name, facility_id, facility_name, session_date, format, participants, facilitator_id, facilitator_name, topics, status) 
VALUES 
  ('ca111111-1111-1111-1111-111111111111',
   'ba111111-1111-1111-1111-111111111111',
   'Child Protection and Safeguarding - Day 1',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Nairobi Training Center',
   CURRENT_DATE + INTERVAL '7 days',
   'In-Person',
   ARRAY['a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222'],
   '11111111-1111-1111-1111-111111111111',
   'John Kamau',
   ARRAY['Introduction to Child Protection', 'Safeguarding Policies', 'Reporting Mechanisms'],
   'scheduled')
ON CONFLICT DO NOTHING;

-- Session 2 - Child Protection Day 2 (John's session)
INSERT INTO training_sessions (id, training_plan_id, training_name, facility_id, facility_name, session_date, format, participants, facilitator_id, facilitator_name, topics, status) 
VALUES 
  ('ca222222-2222-2222-2222-222222222222',
   'ba111111-1111-1111-1111-111111111111',
   'Child Protection and Safeguarding - Day 2',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Nairobi Training Center',
   CURRENT_DATE + INTERVAL '8 days',
   'In-Person',
   ARRAY['a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222'],
   '11111111-1111-1111-1111-111111111111',
   'John Kamau',
   ARRAY['Case Studies', 'Role Playing', 'Practical Assessments'],
   'scheduled')
ON CONFLICT DO NOTHING;

-- Session 3 - Nutrition Training (Brenda's session)
INSERT INTO training_sessions (id, training_plan_id, training_name, facility_id, facility_name, session_date, format, participants, facilitator_id, facilitator_name, topics, status) 
VALUES 
  ('ca333333-3333-3333-3333-333333333333',
   'ba222222-2222-2222-2222-222222222222',
   'Child Nutrition and Health - Day 1',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Mombasa Conference Hall',
   CURRENT_DATE + INTERVAL '14 days',
   'In-Person',
   ARRAY['a3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555'],
   '22222222-2222-2222-2222-222222222222',
   'Brenda Wanjiku',
   ARRAY['Nutritional Requirements', 'Health Monitoring', 'Growth Milestones'],
   'scheduled')
ON CONFLICT DO NOTHING;

-- Session 4 - Virtual M&E Training (John's virtual session)
INSERT INTO training_sessions (id, training_plan_id, training_name, facility_id, facility_name, session_date, format, participants, facilitator_id, facilitator_name, topics, status) 
VALUES 
  ('ca444444-4444-4444-4444-444444444444',
   'ba333333-3333-3333-3333-333333333333',
   'Monitoring and Evaluation Workshop',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Zoom Virtual Platform',
   CURRENT_DATE + INTERVAL '21 days',
   'Virtual',
   ARRAY['a1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444'],
   '11111111-1111-1111-1111-111111111111',
   'John Kamau',
   ARRAY['M&E Frameworks', 'Data Collection Methods', 'Reporting Tools'],
   'scheduled')
ON CONFLICT DO NOTHING;

-- Session 5 - Past completed session for testing
INSERT INTO training_sessions (id, training_plan_id, training_name, facility_id, facility_name, session_date, format, participants, facilitator_id, facilitator_name, topics, status) 
VALUES 
  ('ca555555-5555-5555-5555-555555555555',
   'ba111111-1111-1111-1111-111111111111',
   'Child Protection Refresher Course',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Nairobi Training Center',
   CURRENT_DATE - INTERVAL '30 days',
   'In-Person',
   ARRAY['a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555'],
   '11111111-1111-1111-1111-111111111111',
   'John Kamau',
   ARRAY['Policy Updates', 'Best Practices', 'Case Reviews'],
   'completed')
ON CONFLICT DO NOTHING;

-- ============================================
-- TRAINING MATERIALS
-- ============================================

INSERT INTO training_materials (training_plan_id, title, format, file_path, file_size, status, uploaded_by, version) 
VALUES 
  ('ba111111-1111-1111-1111-111111111111', 'Child Protection Guidelines', 'Presentation', '/materials/child-protection-guidelines.pptx', '2.5 MB', 'approved', '11111111-1111-1111-1111-111111111111', 1),
  ('ba111111-1111-1111-1111-111111111111', 'Safeguarding Policy Handbook', 'Handout', '/materials/safeguarding-handbook.pdf', '1.8 MB', 'approved', '11111111-1111-1111-1111-111111111111', 1),
  ('ba222222-2222-2222-2222-222222222222', 'Nutrition Assessment Tools', 'Presentation', '/materials/nutrition-assessment.pptx', '3.2 MB', 'approved', '22222222-2222-2222-2222-222222222222', 1),
  ('ba222222-2222-2222-2222-222222222222', 'Child Development Milestones Chart', 'Handout', '/materials/development-milestones.pdf', '1.2 MB', 'approved', '22222222-2222-2222-2222-222222222222', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUMMARY
-- ============================================

-- Display summary of created data
SELECT 'Seed data created successfully!' as message;

SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Facilities created:' as info, COUNT(*) as count FROM facilities;
SELECT 'Participants created:' as info, COUNT(*) as count FROM participants;
SELECT 'Training plans created:' as info, COUNT(*) as count FROM training_plans;
SELECT 'Training sessions created:' as info, COUNT(*) as count FROM training_sessions;
SELECT 'Training materials created:' as info, COUNT(*) as count FROM training_materials;

-- Show the users
SELECT 
  name, 
  email, 
  role, 
  array_to_string(regions, ', ') as regions,
  array_to_string(specializations, ', ') as specializations
FROM users 
ORDER BY name;

-- Show upcoming training sessions
SELECT 
  ts.training_name,
  ts.session_date,
  ts.format,
  ts.facilitator_name,
  ts.facility_name,
  ts.status
FROM training_sessions ts
WHERE ts.session_date >= CURRENT_DATE
ORDER BY ts.session_date;
