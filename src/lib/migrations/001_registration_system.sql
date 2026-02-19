-- Registration Links Table
CREATE TABLE IF NOT EXISTS registration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_registration_links_token ON registration_links(token);
CREATE INDEX IF NOT EXISTS idx_registration_links_session ON registration_links(training_session_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_active ON registration_links(is_active);

-- Participant Registrations Table
CREATE TABLE IF NOT EXISTS participant_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_link_id UUID NOT NULL REFERENCES registration_links(id) ON DELETE CASCADE,
  training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  participant_position VARCHAR(255) NOT NULL,
  fcp_number VARCHAR(100) NOT NULL,
  fcp_name VARCHAR(255) NOT NULL,
  cluster VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  attending_with_baby BOOLEAN DEFAULT false,
  nanny_approval_document TEXT,
  waiver_document TEXT,
  attendance_confirmed BOOLEAN DEFAULT false,
  registration_reference VARCHAR(50) NOT NULL UNIQUE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_participant_registrations_session ON participant_registrations(training_session_id);
CREATE INDEX IF NOT EXISTS idx_participant_registrations_email ON participant_registrations(email_address);
CREATE INDEX IF NOT EXISTS idx_participant_registrations_reference ON participant_registrations(registration_reference);
CREATE INDEX IF NOT EXISTS idx_participant_registrations_link ON participant_registrations(registration_link_id);

-- Create unique constraint to prevent duplicate registrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_registration_per_session 
  ON participant_registrations(email_address, training_session_id);

-- Uploaded Documents Table
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES participant_registrations(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('nanny_approval', 'waiver_liability')),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster document lookups
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_registration ON uploaded_documents(registration_id);

-- Link Analytics Table
CREATE TABLE IF NOT EXISTS link_analytics (
  link_id UUID PRIMARY KEY REFERENCES registration_links(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_registrations INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_registration_links_updated_at
  BEFORE UPDATE ON registration_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participant_registrations_updated_at
  BEFORE UPDATE ON participant_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_analytics_updated_at
  BEFORE UPDATE ON link_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to tables for documentation
COMMENT ON TABLE registration_links IS 'Stores unique registration links for training sessions';
COMMENT ON TABLE participant_registrations IS 'Stores participant self-registration data';
COMMENT ON TABLE uploaded_documents IS 'Stores documents uploaded during registration (nanny approval, waivers)';
COMMENT ON TABLE link_analytics IS 'Tracks analytics for registration links (views, conversions)';
