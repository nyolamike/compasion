/**
 * Example usage of RegistrationLinkService
 * This file demonstrates how to use the registration link service
 */

import { db } from './database';
import { RegistrationLinkService } from './registrationLinkService';

// Initialize the service
const registrationLinkService = new RegistrationLinkService(db);

// Example 1: Generate a registration link for a training session
async function generateLinkExample() {
  const sessionId = 'training-session-123';
  const createdBy = 'user-456';
  
  try {
    const link = await registrationLinkService.generateLink(sessionId, createdBy);
    console.log('Generated link:', link);
    console.log('Share this URL:', `${window.location.origin}/register/${link.token}`);
  } catch (error) {
    console.error('Failed to generate link:', error);
  }
}

// Example 2: Validate a registration link
async function validateLinkExample() {
  const token = 'abc123def456...';
  
  try {
    const session = await registrationLinkService.validateLink(token);
    if (session) {
      console.log('Valid link! Training session:', session);
    } else {
      console.log('Invalid or expired link');
    }
  } catch (error) {
    console.error('Failed to validate link:', error);
  }
}

// Example 3: Get link analytics
async function getAnalyticsExample() {
  const linkId = 'link-789';
  
  try {
    const analytics = await registrationLinkService.getLinkAnalytics(linkId);
    if (analytics) {
      console.log('Link analytics:', {
        views: analytics.totalViews,
        uniqueViews: analytics.uniqueViews,
        registrations: analytics.totalRegistrations,
        conversionRate: `${analytics.conversionRate.toFixed(2)}%`
      });
    }
  } catch (error) {
    console.error('Failed to get analytics:', error);
  }
}

// Example 4: Check if link exists for a session
async function checkExistingLinkExample() {
  const sessionId = 'training-session-123';
  
  try {
    const existingLink = await registrationLinkService.getLinkBySessionId(sessionId);
    if (existingLink) {
      console.log('Link already exists:', existingLink);
    } else {
      console.log('No link exists for this session');
    }
  } catch (error) {
    console.error('Failed to check existing link:', error);
  }
}

// Example 5: Deactivate a link
async function deactivateLinkExample() {
  const linkId = 'link-789';
  
  try {
    await registrationLinkService.deactivateLink(linkId);
    console.log('Link deactivated successfully');
  } catch (error) {
    console.error('Failed to deactivate link:', error);
  }
}

export {
  generateLinkExample,
  validateLinkExample,
  getAnalyticsExample,
  checkExistingLinkExample,
  deactivateLinkExample
};
