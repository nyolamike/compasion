-- ============================================
-- CHECK AND FIX DATABASE TABLES
-- ============================================
-- Run this to check if all required tables exist
-- and see what's missing

-- Check which tables exist
SELECT 
  'users' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') as exists
UNION ALL
SELECT 
  'training_sessions',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'training_sessions')
UNION ALL
SELECT 
  'training_plans',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'training_plans')
UNION ALL
SELECT 
  'facilities',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'facilities')
UNION ALL
SELECT 
  'registration_links',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'registration_links')
UNION ALL
SELECT 
  'participant_registrations',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'participant_registrations')
UNION ALL
SELECT 
  'uploaded_documents',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'uploaded_documents')
UNION ALL
SELECT 
  'link_analytics',
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'link_analytics');

-- ============================================
-- INTERPRETATION:
-- ============================================
-- If you see 'false' for any table, it means that table doesn't exist
-- 
-- Next steps based on results:
-- 
-- If base tables (users, training_sessions, etc.) are FALSE:
--   → Run: 000_base_schema.sql
--
-- If registration tables (registration_links, etc.) are FALSE:
--   → Run: 001_registration_system.sql
--
-- ============================================
