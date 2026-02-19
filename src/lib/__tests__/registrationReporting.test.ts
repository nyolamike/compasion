import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../database';
import { supabase } from '../supabase';

describe('Registration Reporting System', () => {
  let testSessionId: string;
  let testLinkId: string;
  let testRegistrationIds: string[] = [];

  beforeAll(async () => {
    // Create a test training session
    const session = await db.createTrainingSession({
      training_plan_id: 'test-plan-1',
      training_name: 'Test Training for Reporting',
      facility_id: 'test-facility-1',
      facility_name: 'Test Facility',
      session_date: '2026-03-15',
      format: 'In-Person',
      participants: [],
      facilitator_id: 'test-facilitator-1',
      facilitator_name: 'Test Facilitator',
      topics: ['Topic 1', 'Topic 2'],
      status: 'scheduled',
    });
    testSessionId = session.id;

    // Create a registration link
    const link = await db.createRegistrationLink({
      training_session_id: testSessionId,
      token: 'test-report-token-' + Date.now(),
      is_active: true,
      expires_at: '2026-03-14',
      created_by: 'test-user-1',
    });
    testLinkId = link.id;

    // Create test registrations
    const regions = ['Central Region', 'Eastern Region', 'Northern Region'];
    const clusters = ['Cluster A', 'Cluster B', 'Cluster C'];
    
    for (let i = 0; i < 5; i++) {
      const registration = await db.createParticipantRegistration({
        registration_link_id: testLinkId,
        training_session_id: testSessionId,
        participant_name: `Test Participant ${i + 1}`,
        mobile_number: `+256700000${i}00`,
        email_address: `test${i}@example.com`,
        participant_position: 'Test Position',
        fcp_number: `FCP-${i + 1}`,
        fcp_name: `Test FCP ${i + 1}`,
        cluster: clusters[i % clusters.length],
        region: regions[i % regions.length],
        attending_with_baby: i % 2 === 0,
        attendance_confirmed: i % 3 !== 0,
        registration_reference: `REF-TEST-${Date.now()}-${i}`,
        registered_at: new Date().toISOString(),
      });
      testRegistrationIds.push(registration.id);
    }
  });

  afterAll(async () => {
    // Clean up test data
    for (const id of testRegistrationIds) {
      await supabase.from('participant_registrations').delete().eq('id', id);
    }
    await supabase.from('registration_links').delete().eq('id', testLinkId);
    await supabase.from('training_sessions').delete().eq('id', testSessionId);
  });

  it('should fetch registration report data with filters', async () => {
    const data = await db.getRegistrationReportData({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Verify data structure
    const firstRecord = data[0];
    expect(firstRecord).toHaveProperty('participant_name');
    expect(firstRecord).toHaveProperty('email_address');
    expect(firstRecord).toHaveProperty('region');
    expect(firstRecord).toHaveProperty('cluster');
    expect(firstRecord).toHaveProperty('training_name');
    expect(firstRecord).toHaveProperty('training_type');
  });

  it('should filter registration data by region', async () => {
    const data = await db.getRegistrationReportData({
      region: 'Central Region',
    });

    expect(data).toBeDefined();
    data.forEach(record => {
      expect(record.region).toBe('Central Region');
    });
  });

  it('should filter registration data by cluster', async () => {
    const data = await db.getRegistrationReportData({
      cluster: 'Cluster A',
    });

    expect(data).toBeDefined();
    data.forEach(record => {
      expect(record.cluster).toBe('Cluster A');
    });
  });

  it('should filter registration data by date range', async () => {
    const startDate = '2026-01-01';
    const endDate = '2026-12-31';
    
    const data = await db.getRegistrationReportData({
      startDate,
      endDate,
    });

    expect(data).toBeDefined();
    data.forEach(record => {
      const registeredDate = new Date(record.registered_at);
      expect(registeredDate >= new Date(startDate)).toBe(true);
      expect(registeredDate <= new Date(endDate)).toBe(true);
    });
  });

  it('should calculate registration statistics correctly', async () => {
    const stats = await db.getRegistrationStatistics({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    expect(stats).toBeDefined();
    expect(stats.totalRegistrations).toBeGreaterThan(0);
    expect(stats.confirmedAttendance).toBeGreaterThanOrEqual(0);
    expect(stats.withBaby).toBeGreaterThanOrEqual(0);
    expect(stats.byRegion).toBeDefined();
    expect(stats.byCluster).toBeDefined();
    expect(stats.byTrainingType).toBeDefined();
    expect(Array.isArray(stats.monthlyTrend)).toBe(true);

    // Verify counts are consistent
    expect(stats.confirmedAttendance).toBeLessThanOrEqual(stats.totalRegistrations);
    expect(stats.withBaby).toBeLessThanOrEqual(stats.totalRegistrations);
  });

  it('should calculate completion rate statistics', async () => {
    const stats = await db.getCompletionRateStatistics({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    expect(stats).toBeDefined();
    expect(stats.totalRegistered).toBeGreaterThan(0);
    expect(stats.totalAttended).toBeGreaterThanOrEqual(0);
    expect(stats.completionRate).toBeGreaterThanOrEqual(0);
    expect(stats.completionRate).toBeLessThanOrEqual(100);
    expect(stats.byTrainingType).toBeDefined();

    // Verify completion rate calculation
    if (stats.totalRegistered > 0) {
      const expectedRate = Math.round((stats.totalAttended / stats.totalRegistered) * 100);
      expect(stats.completionRate).toBe(expectedRate);
    }
  });

  it('should group statistics by region correctly', async () => {
    const stats = await db.getRegistrationStatistics({});

    expect(stats.byRegion).toBeDefined();
    
    const totalByRegion = Object.values(stats.byRegion).reduce((sum, count) => sum + count, 0);
    expect(totalByRegion).toBe(stats.totalRegistrations);
  });

  it('should group statistics by cluster correctly', async () => {
    const stats = await db.getRegistrationStatistics({});

    expect(stats.byCluster).toBeDefined();
    
    const totalByCluster = Object.values(stats.byCluster).reduce((sum, count) => sum + count, 0);
    expect(totalByCluster).toBe(stats.totalRegistrations);
  });

  it('should calculate monthly trend correctly', async () => {
    const stats = await db.getRegistrationStatistics({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    expect(Array.isArray(stats.monthlyTrend)).toBe(true);
    
    if (stats.monthlyTrend.length > 0) {
      stats.monthlyTrend.forEach(item => {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('count');
        expect(typeof item.month).toBe('string');
        expect(typeof item.count).toBe('number');
        expect(item.count).toBeGreaterThan(0);
      });

      // Verify months are sorted
      for (let i = 1; i < stats.monthlyTrend.length; i++) {
        expect(stats.monthlyTrend[i].month >= stats.monthlyTrend[i - 1].month).toBe(true);
      }
    }
  });

  it('should handle empty results gracefully', async () => {
    const data = await db.getRegistrationReportData({
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    });

    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should combine multiple filters correctly', async () => {
    const data = await db.getRegistrationReportData({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      region: 'Central Region',
      cluster: 'Cluster A',
      trainingType: 'In-Person',
    });

    expect(data).toBeDefined();
    data.forEach(record => {
      expect(record.region).toBe('Central Region');
      expect(record.cluster).toBe('Cluster A');
      expect(record.training_type).toBe('In-Person');
    });
  });
});
