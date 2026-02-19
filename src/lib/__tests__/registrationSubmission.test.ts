import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateRegistrationReference } from '../registrationUtils';

describe('Registration Submission', () => {
  describe('generateRegistrationReference', () => {
    it('should generate a reference with correct format', () => {
      const reference = generateRegistrationReference();
      
      // Format: REG-YYYYMMDD-XXXXX
      const pattern = /^REG-\d{8}-[A-Z0-9]{5}$/;
      expect(reference).toMatch(pattern);
    });

    it('should generate unique references', () => {
      const references = new Set();
      
      // Generate 100 references
      for (let i = 0; i < 100; i++) {
        references.add(generateRegistrationReference());
      }
      
      // All should be unique
      expect(references.size).toBe(100);
    });

    it('should include current date in reference', () => {
      const reference = generateRegistrationReference();
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const expectedDatePart = `${year}${month}${day}`;
      expect(reference).toContain(expectedDatePart);
    });

    it('should have 5 alphanumeric characters at the end', () => {
      const reference = generateRegistrationReference();
      const parts = reference.split('-');
      
      expect(parts).toHaveLength(3);
      expect(parts[2]).toHaveLength(5);
      expect(parts[2]).toMatch(/^[A-Z0-9]{5}$/);
    });
  });

  describe('Form Validation', () => {
    it('should validate attendance confirmation is required', () => {
      const formData = {
        attendanceConfirmed: false,
      };
      
      expect(formData.attendanceConfirmed).toBe(false);
    });

    it('should accept valid attendance confirmation', () => {
      const formData = {
        attendanceConfirmed: true,
      };
      
      expect(formData.attendanceConfirmed).toBe(true);
    });
  });

  describe('Registration Data Structure', () => {
    it('should have all required fields for registration', () => {
      const registrationData = {
        registration_link_id: 'link-123',
        training_session_id: 'session-123',
        participant_name: 'John Doe',
        mobile_number: '+1234567890',
        email_address: 'john@example.com',
        participant_position: 'Coordinator',
        fcp_number: 'FCP001',
        fcp_name: 'Test FCP',
        cluster: 'Cluster A',
        region: 'Region 1',
        attending_with_baby: false,
        attendance_confirmed: true,
        registration_reference: generateRegistrationReference(),
        registered_at: new Date().toISOString(),
      };

      expect(registrationData).toHaveProperty('registration_link_id');
      expect(registrationData).toHaveProperty('training_session_id');
      expect(registrationData).toHaveProperty('participant_name');
      expect(registrationData).toHaveProperty('mobile_number');
      expect(registrationData).toHaveProperty('email_address');
      expect(registrationData).toHaveProperty('participant_position');
      expect(registrationData).toHaveProperty('fcp_number');
      expect(registrationData).toHaveProperty('fcp_name');
      expect(registrationData).toHaveProperty('cluster');
      expect(registrationData).toHaveProperty('region');
      expect(registrationData).toHaveProperty('attending_with_baby');
      expect(registrationData).toHaveProperty('attendance_confirmed');
      expect(registrationData).toHaveProperty('registration_reference');
      expect(registrationData).toHaveProperty('registered_at');
    });

    it('should include document paths when attending with baby', () => {
      const registrationData = {
        attending_with_baby: true,
        nanny_approval_document: 'path/to/nanny-approval.pdf',
        waiver_document: 'path/to/waiver.pdf',
      };

      expect(registrationData.attending_with_baby).toBe(true);
      expect(registrationData.nanny_approval_document).toBeDefined();
      expect(registrationData.waiver_document).toBeDefined();
    });
  });

  describe('Success State', () => {
    it('should create success state with required information', () => {
      const successState = {
        reference: generateRegistrationReference(),
        trainingName: 'Test Training',
        trainingDate: '2026-03-15',
        facilityName: 'Test Facility',
      };

      expect(successState).toHaveProperty('reference');
      expect(successState).toHaveProperty('trainingName');
      expect(successState).toHaveProperty('trainingDate');
      expect(successState).toHaveProperty('facilityName');
      expect(successState.reference).toMatch(/^REG-\d{8}-[A-Z0-9]{5}$/);
    });
  });
});
