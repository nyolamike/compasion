import { supabase } from './supabase';

// Types for database operations
export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'manager' | 'coordinator' | 'facilitator';
  regions: string[];
  specializations: string[];
  is_available: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbParticipant {
  id: string;
  name: string;
  email: string;
  region: string;
  role: string;
  organization: string;
  trainings_attended: number;
  average_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbTrainingNeed {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  need_description: string;
  source: string;
  date_identified: string;
  status: 'identified' | 'in-progress' | 'addressed';
  created_at?: string;
  updated_at?: string;
}

export interface DbTrainingPlan {
  id: string;
  title: string;
  objectives: string;
  methodologies: string;
  team_members: string[];
  start_date: string;
  end_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  region: string;
  training_type: 'In-Person' | 'Virtual/Zoom' | 'Blended' | 'Forchildren.Com';
  participant_count: number;
  created_by: string;
  version: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbTrainingMaterial {
  id: string;
  training_plan_id: string;
  title: string;
  format: 'Presentation' | 'Handout' | 'Video' | 'Interactive Activity';
  file_path: string;
  file_size: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  uploaded_by: string;
  version: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbFacility {
  id: string;
  name: string;
  type: 'Hotel Facility' | 'Online Platform';
  capacity: number;
  equipment: string[];
  region: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbTrainingSession {
  id: string;
  training_plan_id: string;
  training_name: string;
  facility_id: string;
  facility_name: string;
  session_date: string;
  format: 'In-Person' | 'Virtual';
  participants: string[];
  facilitator_id: string;
  facilitator_name: string;
  topics: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface DbAttendanceRecord {
  id: string;
  session_id: string;
  participant_id: string;
  participant_name: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  synced: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbEvaluation {
  id: string;
  session_id: string;
  participant_id: string;
  participant_name: string;
  participation_score: number;
  comprehension_score: number;
  practical_application_score: number;
  overall_performance_score: number;
  notes: string;
  synced: boolean;
  evaluated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbFeedback {
  id: string;
  session_id: string;
  participant_id?: string;
  is_anonymous: boolean;
  content_quality: number;
  facilitator_effectiveness: number;
  materials_usefulness: number;
  venue_comfort: number;
  overall_satisfaction: number;
  comments: string;
  synced: boolean;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Survey types
export interface DbSurveyTemplate {
  id: string;
  training_plan_id: string;
  title: string;
  description: string;
  survey_type: 'pre_training' | 'post_training' | 'follow_up_3m' | 'follow_up_6m';
  status: 'draft' | 'active' | 'archived';
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSurveyQuestion {
  id: string;
  survey_template_id: string;
  question_text: string;
  question_type: 'rating' | 'text' | 'multiple_choice' | 'yes_no' | 'scale_1_10';
  options: string[];
  is_required: boolean;
  sort_order: number;
  category: string;
  created_at?: string;
}

export interface DbSurveySchedule {
  id: string;
  survey_template_id: string;
  training_plan_id: string;
  scheduled_date: string;
  follow_up_type: 'immediate' | '1_month' | '3_months' | '6_months';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigned_to: string;
  notes: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSurveyResponse {
  id: string;
  survey_template_id: string;
  survey_schedule_id?: string;
  participant_id: string;
  participant_name: string;
  training_plan_id: string;
  responses: Record<string, any>;
  total_score: number;
  max_possible_score: number;
  submitted_at?: string;
  synced: boolean;
  created_at?: string;
  updated_at?: string;
}

// Offline sync queue item
export interface SyncQueueItem {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  synced: boolean;
  sync_attempts: number;
  last_sync_attempt?: string;
  created_at?: string;
}

// Registration System
export interface DbRegistrationLink {
  id: string;
  training_session_id: string;
  token: string;
  is_active: boolean;
  expires_at: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbParticipantRegistration {
  id: string;
  registration_link_id: string;
  training_session_id: string;
  participant_name: string;
  mobile_number: string;
  email_address: string;
  participant_position: string;
  fcp_number: string;
  fcp_name: string;
  cluster: string;
  region: string;
  attending_with_baby: boolean;
  nanny_approval_document?: string;
  waiver_document?: string;
  attendance_confirmed: boolean;
  registration_reference: string;
  registered_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbUploadedDocument {
  id: string;
  registration_id: string;
  document_type: 'nanny_approval' | 'waiver_liability';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  created_at?: string;
}

export interface DbLinkAnalytics {
  link_id: string;
  total_views: number;
  unique_views: number;
  total_registrations: number;
  conversion_rate: number;
  last_accessed: string;
  created_at?: string;
  updated_at?: string;
}

// CIUG Initiatives Module
export interface DbInitiative {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbInitiativeStage {
  id: string;
  initiative_id: string;
  stage_name: 'PLAN' | 'IMPLEMENT' | 'EVALUATE' | 'CLOSE';
  stage_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbInitiativeTask {
  id: string;
  stage_id: string;
  task_name: string;
  comment: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  created_at: string;
  updated_at: string;
}


// Database service class
class DatabaseService {
  // Users
  async getUsers(): Promise<DbUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async getUserByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  }

  async getUserByRole(role: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }

  // Participants
  async getParticipants(): Promise<DbParticipant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async createParticipant(participant: Omit<DbParticipant, 'id' | 'created_at' | 'updated_at'>): Promise<DbParticipant> {
    const { data, error } = await supabase
      .from('participants')
      .insert(participant)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateParticipant(id: string, updates: Partial<DbParticipant>): Promise<DbParticipant> {
    const { data, error } = await supabase
      .from('participants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Training Needs
  async getTrainingNeeds(): Promise<DbTrainingNeed[]> {
    const { data, error } = await supabase
      .from('training_needs')
      .select('*')
      .order('date_identified', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTrainingNeed(need: Omit<DbTrainingNeed, 'id' | 'created_at' | 'updated_at'>): Promise<DbTrainingNeed> {
    const { data, error } = await supabase
      .from('training_needs')
      .insert(need)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTrainingNeed(id: string, updates: Partial<DbTrainingNeed>): Promise<DbTrainingNeed> {
    const { data, error } = await supabase
      .from('training_needs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Training Plans
  async getTrainingPlans(): Promise<DbTrainingPlan[]> {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTrainingPlan(plan: Omit<DbTrainingPlan, 'id' | 'created_at' | 'updated_at'>): Promise<DbTrainingPlan> {
    const { data, error } = await supabase
      .from('training_plans')
      .insert(plan)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTrainingPlan(id: string, updates: Partial<DbTrainingPlan>): Promise<DbTrainingPlan> {
    const { data, error } = await supabase
      .from('training_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteTrainingPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Training Materials
  async getTrainingMaterials(): Promise<DbTrainingMaterial[]> {
    const { data, error } = await supabase
      .from('training_materials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTrainingMaterial(material: Omit<DbTrainingMaterial, 'id' | 'created_at' | 'updated_at'>): Promise<DbTrainingMaterial> {
    const { data, error } = await supabase
      .from('training_materials')
      .insert(material)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTrainingMaterial(id: string, updates: Partial<DbTrainingMaterial>): Promise<DbTrainingMaterial> {
    const { data, error } = await supabase
      .from('training_materials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Facilities
  async getFacilities(): Promise<DbFacility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async updateFacility(id: string, updates: Partial<DbFacility>): Promise<DbFacility> {
    const { data, error } = await supabase
      .from('facilities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Training Sessions
  async getTrainingSessions(): Promise<DbTrainingSession[]> {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .order('session_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createTrainingSession(session: Omit<DbTrainingSession, 'id' | 'created_at' | 'updated_at'>): Promise<DbTrainingSession> {
    const { data, error } = await supabase
      .from('training_sessions')
      .insert(session)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTrainingSession(id: string, updates: Partial<DbTrainingSession>): Promise<DbTrainingSession> {
    const { data, error } = await supabase
      .from('training_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Attendance Records
  async getAttendanceRecords(): Promise<DbAttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('attendance_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getAttendanceBySession(sessionId: string): Promise<DbAttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId);
    if (error) throw error;
    return data || [];
  }

  async createAttendanceRecord(record: Omit<DbAttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DbAttendanceRecord> {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateAttendanceRecord(id: string, updates: Partial<DbAttendanceRecord>): Promise<DbAttendanceRecord> {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async upsertAttendanceRecord(record: Omit<DbAttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DbAttendanceRecord> {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(record, { onConflict: 'session_id,participant_id,attendance_date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Evaluations
  async getEvaluations(): Promise<DbEvaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('evaluated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createEvaluation(evaluation: Omit<DbEvaluation, 'id' | 'created_at' | 'updated_at'>): Promise<DbEvaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluation)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateEvaluation(id: string, updates: Partial<DbEvaluation>): Promise<DbEvaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Feedback
  async getFeedback(): Promise<DbFeedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createFeedback(feedback: Omit<DbFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<DbFeedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Offline Sync Queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'created_at'>): Promise<SyncQueueItem> {
    const { data, error } = await supabase
      .from('offline_sync_queue')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const { data, error } = await supabase
      .from('offline_sync_queue')
      .select('*')
      .eq('synced', false)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async markSyncItemComplete(id: string): Promise<void> {
    const { error } = await supabase
      .from('offline_sync_queue')
      .update({ synced: true })
      .eq('id', id);
    if (error) throw error;
  }

  async updateSyncAttempt(id: string): Promise<void> {
    const { error } = await supabase
      .from('offline_sync_queue')
      .update({
        sync_attempts: supabase.rpc('increment_sync_attempts', { row_id: id }),
        last_sync_attempt: new Date().toISOString()
      })
      .eq('id', id);
    if (error) {
      // Fallback if RPC doesn't exist
      const { data } = await supabase
        .from('offline_sync_queue')
        .select('sync_attempts')
        .eq('id', id)
        .single();
      if (data) {
        await supabase
          .from('offline_sync_queue')
          .update({
            sync_attempts: (data.sync_attempts || 0) + 1,
            last_sync_attempt: new Date().toISOString()
          })
          .eq('id', id);
      }
    }
  }

  // Sync unsynced attendance records
  async syncAttendanceRecords(): Promise<number> {
    const { data: unsyncedRecords, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('synced', false);

    if (error) throw error;

    let syncedCount = 0;
    for (const record of unsyncedRecords || []) {
      try {
        await supabase
          .from('attendance_records')
          .update({ synced: true, updated_at: new Date().toISOString() })
          .eq('id', record.id);
        syncedCount++;
      } catch (e) {
        console.error('Failed to sync attendance record:', record.id, e);
      }
    }

    return syncedCount;
  }

  // Sync unsynced evaluations
  async syncEvaluations(): Promise<number> {
    const { data: unsyncedRecords, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('synced', false);

    if (error) throw error;

    let syncedCount = 0;
    for (const record of unsyncedRecords || []) {
      try {
        await supabase
          .from('evaluations')
          .update({ synced: true, updated_at: new Date().toISOString() })
          .eq('id', record.id);
        syncedCount++;
      } catch (e) {
        console.error('Failed to sync evaluation:', record.id, e);
      }
    }

    return syncedCount;
  }

  // Sync unsynced feedback
  async syncFeedback(): Promise<number> {
    const { data: unsyncedRecords, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('synced', false);

    if (error) throw error;

    let syncedCount = 0;
    for (const record of unsyncedRecords || []) {
      try {
        await supabase
          .from('feedback')
          .update({ synced: true, updated_at: new Date().toISOString() })
          .eq('id', record.id);
        syncedCount++;
      } catch (e) {
        console.error('Failed to sync feedback:', record.id, e);
      }
    }

    return syncedCount;
  }

  // Sync all pending data
  async syncAllPendingData(): Promise<{ attendance: number; evaluations: number; feedback: number }> {
    const attendance = await this.syncAttendanceRecords();
    const evaluations = await this.syncEvaluations();
    const feedback = await this.syncFeedback();

    return { attendance, evaluations, feedback };
  }

  // Get count of unsynced records
  async getUnsyncedCount(): Promise<number> {
    const [attendance, evaluations, feedback] = await Promise.all([
      supabase.from('attendance_records').select('id', { count: 'exact' }).eq('synced', false),
      supabase.from('evaluations').select('id', { count: 'exact' }).eq('synced', false),
      supabase.from('feedback').select('id', { count: 'exact' }).eq('synced', false),
    ]);

    return (attendance.count || 0) + (evaluations.count || 0) + (feedback.count || 0);
  }

  // ============ SURVEY METHODS ============

  // Survey Templates
  async getSurveyTemplates(): Promise<DbSurveyTemplate[]> {
    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSurveyTemplate(template: Omit<DbSurveyTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DbSurveyTemplate> {
    const { data, error } = await supabase
      .from('survey_templates')
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSurveyTemplate(id: string, updates: Partial<DbSurveyTemplate>): Promise<DbSurveyTemplate> {
    const { data, error } = await supabase
      .from('survey_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteSurveyTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('survey_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Survey Questions
  async getSurveyQuestions(templateId?: string): Promise<DbSurveyQuestion[]> {
    let query = supabase
      .from('survey_questions')
      .select('*')
      .order('sort_order', { ascending: true });
    if (templateId) {
      query = query.eq('survey_template_id', templateId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createSurveyQuestion(question: Omit<DbSurveyQuestion, 'id' | 'created_at'>): Promise<DbSurveyQuestion> {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(question)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSurveyQuestion(id: string, updates: Partial<DbSurveyQuestion>): Promise<DbSurveyQuestion> {
    const { data, error } = await supabase
      .from('survey_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteSurveyQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('survey_questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Survey Schedules
  async getSurveySchedules(): Promise<DbSurveySchedule[]> {
    const { data, error } = await supabase
      .from('survey_schedules')
      .select('*')
      .order('scheduled_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createSurveySchedule(schedule: Omit<DbSurveySchedule, 'id' | 'created_at' | 'updated_at'>): Promise<DbSurveySchedule> {
    const { data, error } = await supabase
      .from('survey_schedules')
      .insert(schedule)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSurveySchedule(id: string, updates: Partial<DbSurveySchedule>): Promise<DbSurveySchedule> {
    const { data, error } = await supabase
      .from('survey_schedules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Survey Responses
  async getSurveyResponses(templateId?: string): Promise<DbSurveyResponse[]> {
    let query = supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (templateId) {
      query = query.eq('survey_template_id', templateId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createSurveyResponse(response: Omit<DbSurveyResponse, 'id' | 'created_at' | 'updated_at'>): Promise<DbSurveyResponse> {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert(response)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ============ REGISTRATION SYSTEM METHODS ============

  // Registration Links
  async getRegistrationLinks(): Promise<DbRegistrationLink[]> {
    const { data, error } = await supabase
      .from('registration_links')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRegistrationLinkByToken(token: string): Promise<DbRegistrationLink | null> {
    const { data, error } = await supabase
      .from('registration_links')
      .select('*')
      .eq('token', token)
      .single();
    if (error) return null;
    return data;
  }

  async getRegistrationLinkBySessionId(sessionId: string): Promise<DbRegistrationLink | null> {
    const { data, error } = await supabase
      .from('registration_links')
      .select('*')
      .eq('training_session_id', sessionId)
      .eq('is_active', true)
      .single();
    if (error) return null;
    return data;
  }

  async createRegistrationLink(link: Omit<DbRegistrationLink, 'id' | 'created_at' | 'updated_at'>): Promise<DbRegistrationLink> {
    const { data, error } = await supabase
      .from('registration_links')
      .insert(link)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateRegistrationLink(id: string, updates: Partial<DbRegistrationLink>): Promise<DbRegistrationLink> {
    const { data, error } = await supabase
      .from('registration_links')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deactivateRegistrationLink(id: string): Promise<void> {
    const { error } = await supabase
      .from('registration_links')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  // Participant Registrations
  async getParticipantRegistrations(): Promise<DbParticipantRegistration[]> {
    const { data, error } = await supabase
      .from('participant_registrations')
      .select('*')
      .order('registered_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRegistrationsBySessionId(sessionId: string): Promise<DbParticipantRegistration[]> {
    const { data, error } = await supabase
      .from('participant_registrations')
      .select('*')
      .eq('training_session_id', sessionId)
      .order('registered_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRegistrationByEmail(email: string, sessionId: string): Promise<DbParticipantRegistration | null> {
    const { data, error } = await supabase
      .from('participant_registrations')
      .select('*')
      .eq('email_address', email)
      .eq('training_session_id', sessionId)
      .single();
    if (error) return null;
    return data;
  }

  async getRegistrationByReference(reference: string): Promise<DbParticipantRegistration | null> {
    const { data, error } = await supabase
      .from('participant_registrations')
      .select('*')
      .eq('registration_reference', reference)
      .single();
    if (error) return null;
    return data;
  }

  async createParticipantRegistration(registration: Omit<DbParticipantRegistration, 'id' | 'created_at' | 'updated_at'>): Promise<DbParticipantRegistration> {
    const { data, error } = await supabase
      .from('participant_registrations')
      .insert(registration)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateParticipantRegistration(id: string, updates: Partial<DbParticipantRegistration>): Promise<DbParticipantRegistration> {
    const { data, error } = await supabase
      .from('participant_registrations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Uploaded Documents
  async getUploadedDocuments(registrationId: string): Promise<DbUploadedDocument[]> {
    const { data, error } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('registration_id', registrationId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createUploadedDocument(document: Omit<DbUploadedDocument, 'id' | 'created_at'>): Promise<DbUploadedDocument> {
    const { data, error } = await supabase
      .from('uploaded_documents')
      .insert(document)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteUploadedDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('uploaded_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Link Analytics
  async getLinkAnalytics(linkId: string): Promise<DbLinkAnalytics | null> {
    const { data, error } = await supabase
      .from('link_analytics')
      .select('*')
      .eq('link_id', linkId)
      .single();
    if (error) return null;
    return data;
  }

  async createLinkAnalytics(analytics: Omit<DbLinkAnalytics, 'created_at' | 'updated_at'>): Promise<DbLinkAnalytics> {
    const { data, error } = await supabase
      .from('link_analytics')
      .insert(analytics)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateLinkAnalytics(linkId: string, updates: Partial<DbLinkAnalytics>): Promise<DbLinkAnalytics> {
    const { data, error } = await supabase
      .from('link_analytics')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('link_id', linkId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async incrementLinkViews(linkId: string, isUnique: boolean = false): Promise<void> {
    const analytics = await this.getLinkAnalytics(linkId);

    if (analytics) {
      const updates: Partial<DbLinkAnalytics> = {
        total_views: analytics.total_views + 1,
        last_accessed: new Date().toISOString(),
      };
      if (isUnique) {
        updates.unique_views = analytics.unique_views + 1;
      }
      await this.updateLinkAnalytics(linkId, updates);
    } else {
      await this.createLinkAnalytics({
        link_id: linkId,
        total_views: 1,
        unique_views: isUnique ? 1 : 0,
        total_registrations: 0,
        conversion_rate: 0,
        last_accessed: new Date().toISOString(),
      });
    }
  }

  async incrementLinkRegistrations(linkId: string): Promise<void> {
    const analytics = await this.getLinkAnalytics(linkId);
    if (analytics) {
      const totalRegistrations = analytics.total_registrations + 1;
      const conversionRate = analytics.total_views > 0 
        ? (totalRegistrations / analytics.total_views) * 100 
        : 0;
      await this.updateLinkAnalytics(linkId, {
        total_registrations: totalRegistrations,
        conversion_rate: conversionRate,
      });
    }
  }

  // ============ REGISTRATION INTEGRATION METHODS ============

  /**
   * Get registered participants for a training session
   * Returns participant data from registrations
   */
  async getRegisteredParticipantsForSession(sessionId: string): Promise<DbParticipantRegistration[]> {
    return this.getRegistrationsBySessionId(sessionId);
  }

  /**
   * Get total participant count for a session (manual + registered)
   */
  async getSessionParticipantCount(sessionId: string): Promise<{ manual: number; registered: number; total: number }> {
    const session = await supabase
      .from('training_sessions')
      .select('participants')
      .eq('id', sessionId)
      .single();

    const registrations = await this.getRegistrationsBySessionId(sessionId);

    const manualCount = session.data?.participants?.length || 0;
    const registeredCount = registrations.length;

    return {
      manual: manualCount,
      registered: registeredCount,
      total: manualCount + registeredCount,
    };
  }

  /**
   * Create attendance records for registered participants
   * This allows trainers to track attendance for self-registered participants
   */
  async createAttendanceForRegisteredParticipant(
    registrationId: string,
    sessionId: string,
    status: 'present' | 'absent' | 'late' | 'excused' = 'present'
  ): Promise<DbAttendanceRecord> {
    const registration = await this.getRegistrationByReference(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    const session = await supabase
      .from('training_sessions')
      .select('session_date')
      .eq('id', sessionId)
      .single();

    if (!session.data) {
      throw new Error('Session not found');
    }

    // Check if attendance record already exists
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)
      .eq('participant_id', registration.id)
      .eq('attendance_date', session.data.session_date)
      .single();

    if (existing) {
      // Update existing record
      return this.updateAttendanceRecord(existing.id, { status });
    }

    // Create new attendance record
    return this.createAttendanceRecord({
      session_id: sessionId,
      participant_id: registration.id,
      participant_name: registration.participant_name,
      attendance_date: session.data.session_date,
      status,
      synced: true,
    });
  }

  /**
   * Get attendance records for registered participants
   */
  async getAttendanceForRegisteredParticipants(sessionId: string): Promise<DbAttendanceRecord[]> {
    const registrations = await this.getRegistrationsBySessionId(sessionId);
    const registrationIds = registrations.map(r => r.id);

    if (registrationIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)
      .in('participant_id', registrationIds);

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if a registered participant has attendance recorded
   */
  async hasAttendanceRecord(registrationId: string, sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('session_id', sessionId)
      .eq('participant_id', registrationId)
      .single();

    return !!data && !error;
  }

  /**
   * Get or create participant record from registration
   * This links registered participants to the main participants table
   */
  async getOrCreateParticipantFromRegistration(registrationId: string): Promise<DbParticipant> {
    const registration = await supabase
      .from('participant_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (!registration.data) {
      throw new Error('Registration not found');
    }

    const reg = registration.data;

    // Check if participant already exists by email
    const { data: existing } = await supabase
      .from('participants')
      .select('*')
      .eq('email', reg.email_address)
      .single();

    if (existing) {
      return existing;
    }

    // Create new participant
    return this.createParticipant({
      name: reg.participant_name,
      email: reg.email_address,
      region: reg.region,
      role: reg.participant_position,
      organization: reg.fcp_name,
      trainings_attended: 0,
      average_score: 0,
    });
  }

  // ============ REGISTRATION REPORTING METHODS ============

  /**
   * Get registration report data with filters
   */
  async getRegistrationReportData(filters: {
    startDate?: string;
    endDate?: string;
    trainingType?: string;
    region?: string;
    cluster?: string;
  }): Promise<Array<DbParticipantRegistration & { training_name: string; training_type: string; session_date: string }>> {
    let query = supabase
      .from('participant_registrations')
      .select(`
        *,
        training_sessions!inner(
          training_name,
          format,
          session_date
        )
      `)
      .order('registered_at', { ascending: false });

    // Apply filters
    if (filters.startDate) {
      query = query.gte('registered_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('registered_at', filters.endDate);
    }
    if (filters.region && filters.region !== 'all') {
      query = query.eq('region', filters.region);
    }
    if (filters.cluster && filters.cluster !== 'all') {
      query = query.eq('cluster', filters.cluster);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter by training type if specified
    let results = data || [];
    if (filters.trainingType && filters.trainingType !== 'all') {
      results = results.filter((r: any) => r.training_sessions?.format === filters.trainingType);
    }

    // Flatten the nested structure
    return results.map((r: any) => ({
      ...r,
      training_name: r.training_sessions?.training_name || 'Unknown',
      training_type: r.training_sessions?.format || 'Unknown',
      session_date: r.training_sessions?.session_date || '',
    }));
  }

  /**
   * Get registration statistics for analytics
   */
  async getRegistrationStatistics(filters: {
    startDate?: string;
    endDate?: string;
    region?: string;
  }): Promise<{
    totalRegistrations: number;
    confirmedAttendance: number;
    withBaby: number;
    byRegion: Record<string, number>;
    byCluster: Record<string, number>;
    byTrainingType: Record<string, number>;
    monthlyTrend: Array<{ month: string; count: number }>;
  }> {
    const registrations = await this.getRegistrationReportData(filters);

    const stats = {
      totalRegistrations: registrations.length,
      confirmedAttendance: registrations.filter(r => r.attendance_confirmed).length,
      withBaby: registrations.filter(r => r.attending_with_baby).length,
      byRegion: {} as Record<string, number>,
      byCluster: {} as Record<string, number>,
      byTrainingType: {} as Record<string, number>,
      monthlyTrend: [] as Array<{ month: string; count: number }>,
    };

    // Count by region
    registrations.forEach(r => {
      stats.byRegion[r.region] = (stats.byRegion[r.region] || 0) + 1;
      stats.byCluster[r.cluster] = (stats.byCluster[r.cluster] || 0) + 1;
      stats.byTrainingType[r.training_type] = (stats.byTrainingType[r.training_type] || 0) + 1;
    });

    // Calculate monthly trend
    const monthlyData: Record<string, number> = {};
    registrations.forEach(r => {
      const date = new Date(r.registered_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    stats.monthlyTrend = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return stats;
  }

  /**
   * Get completion rate statistics
   */
  async getCompletionRateStatistics(filters: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalRegistered: number;
    totalAttended: number;
    completionRate: number;
    byTrainingType: Record<string, { registered: number; attended: number; rate: number }>;
  }> {
    const registrations = await this.getRegistrationReportData(filters);

    const stats = {
      totalRegistered: registrations.length,
      totalAttended: 0,
      completionRate: 0,
      byTrainingType: {} as Record<string, { registered: number; attended: number; rate: number }>,
    };

    // Check attendance records for each registration
    for (const reg of registrations) {
      const hasAttended = await this.hasAttendanceRecord(reg.id, reg.training_session_id);
      if (hasAttended) {
        stats.totalAttended++;
      }

      // Track by training type
      if (!stats.byTrainingType[reg.training_type]) {
        stats.byTrainingType[reg.training_type] = { registered: 0, attended: 0, rate: 0 };
      }
      stats.byTrainingType[reg.training_type].registered++;
      if (hasAttended) {
        stats.byTrainingType[reg.training_type].attended++;
      }
    }

    // Calculate rates
    stats.completionRate = stats.totalRegistered > 0 
      ? Math.round((stats.totalAttended / stats.totalRegistered) * 100) 
      : 0;

    Object.keys(stats.byTrainingType).forEach(type => {
      const typeStats = stats.byTrainingType[type];
      typeStats.rate = typeStats.registered > 0 
        ? Math.round((typeStats.attended / typeStats.registered) * 100) 
        : 0;
    });

    return stats;
  }

  // ============ CIUG INITIATIVES MODULE METHODS ============

  // Initiatives
  async getInitiatives(): Promise<DbInitiative[]> {
    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getInitiativeById(id: string): Promise<DbInitiative | null> {
    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async createInitiative(initiative: Omit<DbInitiative, 'id' | 'created_at' | 'updated_at'>): Promise<DbInitiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .insert(initiative)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateInitiative(id: string, updates: Partial<DbInitiative>): Promise<DbInitiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteInitiative(id: string): Promise<void> {
    const { error } = await supabase
      .from('initiatives')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Initiative Stages
  async getStagesByInitiativeId(initiativeId: string): Promise<DbInitiativeStage[]> {
    const { data, error } = await supabase
      .from('initiative_stages')
      .select('*')
      .eq('initiative_id', initiativeId)
      .order('stage_order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createInitiativeStage(stage: Omit<DbInitiativeStage, 'id' | 'created_at' | 'updated_at'>): Promise<DbInitiativeStage> {
    const { data, error } = await supabase
      .from('initiative_stages')
      .insert(stage)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Initiative Tasks
  async getTasksByStageId(stageId: string): Promise<DbInitiativeTask[]> {
    const { data, error } = await supabase
      .from('initiative_tasks')
      .select('*')
      .eq('stage_id', stageId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createInitiativeTask(task: Omit<DbInitiativeTask, 'id' | 'created_at' | 'updated_at'>): Promise<DbInitiativeTask> {
    const { data, error } = await supabase
      .from('initiative_tasks')
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateInitiativeTask(id: string, updates: Partial<DbInitiativeTask>): Promise<DbInitiativeTask> {
    const { data, error } = await supabase
      .from('initiative_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteInitiativeTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('initiative_tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Convenience method for loading complete initiative data
  async getInitiativeWithStagesAndTasks(initiativeId: string): Promise<{
    initiative: DbInitiative;
    stages: Array<DbInitiativeStage & { tasks: DbInitiativeTask[] }>;
  }> {
    const initiative = await this.getInitiativeById(initiativeId);
    if (!initiative) {
      throw new Error('Initiative not found');
    }

    const stages = await this.getStagesByInitiativeId(initiativeId);
    
    // Load tasks for each stage
    const stagesWithTasks = await Promise.all(
      stages.map(async (stage) => {
        const tasks = await this.getTasksByStageId(stage.id);
        return { ...stage, tasks };
      })
    );

    return {
      initiative,
      stages: stagesWithTasks,
    };
  }
}

export { DatabaseService };
export const db = new DatabaseService();
export const databaseService = db;
