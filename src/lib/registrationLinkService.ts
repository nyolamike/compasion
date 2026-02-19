import { DatabaseService, db } from './database';
import type { 
  RegistrationLink, 
  TrainingSession,
  LinkAnalytics 
} from '../types';
import type { 
  DbRegistrationLink, 
  DbTrainingSession,
  DbLinkAnalytics 
} from './database';

/**
 * Generates a cryptographically secure random token for registration links
 * @param length - Length of the token (default: 32)
 * @returns A URL-safe random token string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  // Convert to base64url format (URL-safe)
  return Array.from(array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length);
}

/**
 * Validates if a token meets security requirements
 * @param token - Token to validate
 * @returns True if token is valid
 */
export function validateTokenFormat(token: string): boolean {
  // Token should be alphanumeric and at least 16 characters
  const tokenRegex = /^[a-f0-9]{16,}$/;
  return tokenRegex.test(token);
}

/**
 * Service class for managing registration links
 */
export class RegistrationLinkService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Generates a new registration link for a training session
   * @param sessionId - Training session ID
   * @param createdBy - User ID creating the link
   * @returns The created registration link
   */
  async generateLink(sessionId: string, createdBy: string): Promise<RegistrationLink> {
    // Check if link already exists for this session
    const existingLink = await this.db.getRegistrationLinkBySessionId(sessionId);
    if (existingLink && existingLink.is_active) {
      return this.mapDbToRegistrationLink(existingLink);
    }

    // Get training session to calculate expiration
    const sessions = await this.db.getTrainingSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Training session not found');
    }

    // Generate secure token
    const token = generateSecureToken(32);

    // Set expiration to training session date
    const expiresAt = new Date(session.session_date);
    
    // Create registration link
    const linkData: Omit<DbRegistrationLink, 'id' | 'created_at' | 'updated_at'> = {
      training_session_id: sessionId,
      token,
      is_active: true,
      expires_at: expiresAt.toISOString(),
      created_by: createdBy
    };

    const dbLink = await this.db.createRegistrationLink(linkData);

    // Initialize analytics for the link
    await this.db.createLinkAnalytics({
      link_id: dbLink.id,
      total_views: 0,
      unique_views: 0,
      total_registrations: 0,
      conversion_rate: 0,
      last_accessed: new Date().toISOString()
    });

    return this.mapDbToRegistrationLink(dbLink);
  }

  /**
   * Validates a registration link token and returns associated training session
   * @param token - Registration link token
   * @returns Validation result with training session if valid
   */
  async validateLink(token: string): Promise<{
    isValid: boolean;
    error?: string;
    trainingSession?: TrainingSession;
  }> {
    // Validate token format
    if (!validateTokenFormat(token)) {
      return {
        isValid: false,
        error: 'Invalid registration link format.'
      };
    }

    // Get link by token
    const link = await this.db.getRegistrationLinkByToken(token);
    if (!link) {
      return {
        isValid: false,
        error: 'Registration link not found. Please check the link and try again.'
      };
    }

    // Check if link is active
    if (!link.is_active) {
      return {
        isValid: false,
        error: 'This registration link has been deactivated. Please contact the trainer for a new link.'
      };
    }

    // Check if link has expired
    const now = new Date();
    const expiresAt = new Date(link.expires_at);
    if (now > expiresAt) {
      // Deactivate expired link
      await this.db.deactivateRegistrationLink(link.id);
      return {
        isValid: false,
        error: 'This registration link has expired. The registration deadline has passed.'
      };
    }

    // Get associated training session
    const sessions = await this.db.getTrainingSessions();
    const session = sessions.find(s => s.id === link.training_session_id);
    if (!session) {
      return {
        isValid: false,
        error: 'Training session not found. Please contact the trainer.'
      };
    }

    // Check if training session is in the past
    const sessionDate = new Date(session.session_date);
    if (now > sessionDate) {
      // Deactivate link for past training
      await this.db.deactivateRegistrationLink(link.id);
      return {
        isValid: false,
        error: 'This training session has already taken place. Registration is no longer available.'
      };
    }

    // Increment view count
    await this.db.incrementLinkViews(link.id, false);

    return {
      isValid: true,
      trainingSession: this.mapDbToTrainingSession(session)
    };
  }

  /**
   * Gets analytics for a registration link
   * @param linkId - Registration link ID
   * @returns Link analytics data
   */
  async getLinkAnalytics(linkId: string): Promise<LinkAnalytics | null> {
    const dbAnalytics = await this.db.getLinkAnalytics(linkId);
    if (!dbAnalytics) {
      return null;
    }

    return this.mapDbToLinkAnalytics(dbAnalytics);
  }

  /**
   * Deactivates a registration link
   * @param linkId - Registration link ID
   */
  async deactivateLink(linkId: string): Promise<void> {
    await this.db.deactivateRegistrationLink(linkId);
  }

  /**
   * Gets a registration link by session ID
   * @param sessionId - Training session ID
   * @returns Registration link if exists
   */
  async getLinkBySessionId(sessionId: string): Promise<RegistrationLink | null> {
    const dbLink = await this.db.getRegistrationLinkBySessionId(sessionId);
    if (!dbLink) {
      return null;
    }
    return this.mapDbToRegistrationLink(dbLink);
  }

  /**
   * Gets a registration link by token
   * @param token - Registration link token
   * @returns Registration link if exists
   */
  async getLinkByToken(token: string): Promise<RegistrationLink | null> {
    const dbLink = await this.db.getRegistrationLinkByToken(token);
    if (!dbLink) {
      return null;
    }
    return this.mapDbToRegistrationLink(dbLink);
  }

  /**
   * Checks if a registration link is valid and active
   * @param token - Registration link token
   * @returns True if link is valid and active
   */
  async isLinkValid(token: string): Promise<boolean> {
    const result = await this.validateLink(token);
    return result.isValid;
  }

  // Mapping functions
  private mapDbToRegistrationLink(dbLink: DbRegistrationLink): RegistrationLink {
    return {
      id: dbLink.id,
      trainingSessionId: dbLink.training_session_id,
      token: dbLink.token,
      isActive: dbLink.is_active,
      expiresAt: dbLink.expires_at,
      createdBy: dbLink.created_by,
      createdAt: dbLink.created_at || new Date().toISOString(),
      updatedAt: dbLink.updated_at || new Date().toISOString()
    };
  }

  private mapDbToTrainingSession(dbSession: DbTrainingSession): TrainingSession {
    return {
      id: dbSession.id,
      trainingPlanId: dbSession.training_plan_id,
      trainingName: dbSession.training_name,
      facilityId: dbSession.facility_id,
      facilityName: dbSession.facility_name,
      date: dbSession.session_date,
      format: dbSession.format,
      participants: dbSession.participants,
      facilitatorId: dbSession.facilitator_id,
      facilitatorName: dbSession.facilitator_name,
      topics: dbSession.topics,
      status: dbSession.status
    };
  }

  private mapDbToLinkAnalytics(dbAnalytics: DbLinkAnalytics): LinkAnalytics {
    return {
      linkId: dbAnalytics.link_id,
      totalViews: dbAnalytics.total_views,
      uniqueViews: dbAnalytics.unique_views,
      totalRegistrations: dbAnalytics.total_registrations,
      conversionRate: dbAnalytics.conversion_rate,
      lastAccessed: dbAnalytics.last_accessed
    };
  }
}

// Export singleton instance
export const registrationLinkService = new RegistrationLinkService(db);
