-- CIUG Initiatives Module Schema
-- This migration creates tables for managing initiatives through a 4-stage lifecycle
-- (PLAN → IMPLEMENT → EVALUATE → CLOSE) with RACI-based task assignments

-- Initiatives Table
CREATE TABLE IF NOT EXISTS initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries on creation date
CREATE INDEX IF NOT EXISTS idx_initiatives_created_at ON initiatives(created_at DESC);

-- Initiative Stages Table
CREATE TABLE IF NOT EXISTS initiative_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL CHECK (stage_name IN ('PLAN', 'IMPLEMENT', 'EVALUATE', 'CLOSE')),
  stage_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, stage_name)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_initiative_stages_initiative_id ON initiative_stages(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_stages_order ON initiative_stages(initiative_id, stage_order);

-- Initiative Tasks Table
CREATE TABLE IF NOT EXISTS initiative_tasks (
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_initiative_tasks_stage_id ON initiative_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_initiative_tasks_created_at ON initiative_tasks(created_at);

-- Create trigger function for updated_at if it doesn't exist
-- (This function may already exist from previous migrations)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to update updated_at timestamp automatically
CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_initiative_stages_updated_at
  BEFORE UPDATE ON initiative_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_initiative_tasks_updated_at
  BEFORE UPDATE ON initiative_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to tables for documentation
COMMENT ON TABLE initiatives IS 'Stores CIUG initiatives managed through 4-stage lifecycle';
COMMENT ON TABLE initiative_stages IS 'Stores the four stages (PLAN, IMPLEMENT, EVALUATE, CLOSE) for each initiative';
COMMENT ON TABLE initiative_tasks IS 'Stores tasks within stages with RACI role assignments';
