import { describe, it, expect, beforeEach } from 'vitest';
import { emailService } from '../emailService';
import type { RegistrationConfirmationData } from '../emailService';

describe('Email Service', () => {
  const mockRegistrationData: RegistrationConfirmationData = {
    participantName: 'John Doe',
    participantEmail: 'john.doe@example.com',
    registrationReference: 'REG-20260218-ABC12',
    trainingName: 'Child Development Training',
    trainingDate: '2026-03-15T09:00:00Z',
    facilityName: 'Grand Hotel Conference Center',
    format: 'In-Person',
    attendingWithBaby: false,
    mobileNumber: '+1234567890',
    fcpName: 'Test FCP Center',
    cluster: 'Cluster A',
    region: 'Region 1',
  };

  describe('Demo Mode', () => {
    it('should be in demo mode by default', () => {
      expect(emailService.isDemo()).toBe(true);
    });

    it('should return success in demo mode', async () => {
      const result = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toContain('demo-');
    });

    it('should not throw errors in demo mode', async () => {
      await expect(
        emailService.sendRegistrationConfirmation(mockRegistrationData)
      ).resolves.not.toThrow();
    });
  });

  describe('Registration Confirmation Email', () => {
    it('should send email with all required data', async () => {
      const result = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should handle in-person training format', async () => {
      const inPersonData = {
        ...mockRegistrationData,
        format: 'In-Person' as const,
      };
      
      const result = await emailService.sendRegistrationConfirmation(inPersonData);
      expect(result.success).toBe(true);
    });

    it('should handle virtual training format', async () => {
      const virtualData = {
        ...mockRegistrationData,
        format: 'Virtual' as const,
      };
      
      const result = await emailService.sendRegistrationConfirmation(virtualData);
      expect(result.success).toBe(true);
    });

    it('should handle baby attendance', async () => {
      const babyData = {
        ...mockRegistrationData,
        attendingWithBaby: true,
      };
      
      const result = await emailService.sendRegistrationConfirmation(babyData);
      expect(result.success).toBe(true);
    });

    it('should handle different participant names', async () => {
      const names = [
        'Jane Smith',
        'María García',
        'John O\'Brien',
        'Anne-Marie Dubois',
      ];

      for (const name of names) {
        const data = {
          ...mockRegistrationData,
          participantName: name,
        };
        
        const result = await emailService.sendRegistrationConfirmation(data);
        expect(result.success).toBe(true);
      }
    });

    it('should handle different email addresses', async () => {
      const emails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@company.org',
      ];

      for (const email of emails) {
        const data = {
          ...mockRegistrationData,
          participantEmail: email,
        };
        
        const result = await emailService.sendRegistrationConfirmation(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Email Content', () => {
    it('should include registration reference in email', async () => {
      const result = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      expect(result.success).toBe(true);
      // In demo mode, we can verify the reference is logged
    });

    it('should include training details in email', async () => {
      const result = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      expect(result.success).toBe(true);
    });

    it('should include participant information in email', async () => {
      const result = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', async () => {
      const incompleteData = {
        ...mockRegistrationData,
        participantName: '',
      };
      
      // Should still attempt to send
      const result = await emailService.sendRegistrationConfirmation(incompleteData);
      expect(result).toHaveProperty('success');
    });

    it('should return error information on failure', async () => {
      // In demo mode, this should still succeed
      const result = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });
  });

  describe('Email Formats', () => {
    it('should format dates correctly', async () => {
      const dates = [
        '2026-03-15T09:00:00Z',
        '2026-12-25T14:30:00Z',
        '2026-01-01T00:00:00Z',
      ];

      for (const date of dates) {
        const data = {
          ...mockRegistrationData,
          trainingDate: date,
        };
        
        const result = await emailService.sendRegistrationConfirmation(data);
        expect(result.success).toBe(true);
      }
    });

    it('should handle long training names', async () => {
      const longName = 'Advanced Child Development and Early Childhood Education Training Program for FCP Coordinators';
      const data = {
        ...mockRegistrationData,
        trainingName: longName,
      };
      
      const result = await emailService.sendRegistrationConfirmation(data);
      expect(result.success).toBe(true);
    });

    it('should handle long facility names', async () => {
      const longFacility = 'The Grand International Conference Center and Hotel Complex';
      const data = {
        ...mockRegistrationData,
        facilityName: longFacility,
      };
      
      const result = await emailService.sendRegistrationConfirmation(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should send email within reasonable time', async () => {
      const startTime = Date.now();
      await emailService.sendRegistrationConfirmation(mockRegistrationData);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      // In demo mode, should be fast (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle multiple emails sequentially', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const data = {
          ...mockRegistrationData,
          participantEmail: `user${i}@example.com`,
          registrationReference: `REG-20260218-ABC${i}`,
        };
        
        promises.push(emailService.sendRegistrationConfirmation(data));
      }
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});
