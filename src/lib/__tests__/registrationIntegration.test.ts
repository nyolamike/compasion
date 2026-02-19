import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../database';

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null })),
        })),
        in: vi.fn(() => ({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: {}, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: {}, error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe('Registration Integration', () => {
  describe('getRegisteredParticipantsForSession', () => {
    it('should return registered participants for a session', async () => {
      const sessionId = 'test-session-id';
      const result = await db.getRegisteredParticipantsForSession(sessionId);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getSessionParticipantCount', () => {
    it('should return participant counts', async () => {
      const sessionId = 'test-session-id';
      const result = await db.getSessionParticipantCount(sessionId);
      expect(result).toHaveProperty('manual');
      expect(result).toHaveProperty('registered');
      expect(result).toHaveProperty('total');
      expect(typeof result.manual).toBe('number');
      expect(typeof result.registered).toBe('number');
      expect(typeof result.total).toBe('number');
    });
  });

  describe('getAttendanceForRegisteredParticipants', () => {
    it('should return attendance records for registered participants', async () => {
      const sessionId = 'test-session-id';
      const result = await db.getAttendanceForRegisteredParticipants(sessionId);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('hasAttendanceRecord', () => {
    it('should check if attendance record exists', async () => {
      const registrationId = 'test-registration-id';
      const sessionId = 'test-session-id';
      const result = await db.hasAttendanceRecord(registrationId, sessionId);
      expect(typeof result).toBe('boolean');
    });
  });
});
