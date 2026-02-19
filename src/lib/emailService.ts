/**
 * Email Notification Service
 * 
 * This service handles sending email notifications for the registration system.
 * It supports both demo mode (for prototyping) and production mode (real emails).
 * 
 * Configuration:
 * - Set VITE_EMAIL_DEMO_MODE=true for demo mode (no actual emails sent)
 * - Set VITE_EMAIL_DEMO_MODE=false for production mode (real emails via Supabase)
 */

import { supabase } from './supabase';

// Email configuration
const EMAIL_DEMO_MODE = import.meta.env.VITE_EMAIL_DEMO_MODE !== 'false';
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@trainingportal.com';
const FROM_NAME = import.meta.env.VITE_FROM_NAME || 'Training Portal';

// Email template types
export type EmailTemplate = 'registration_confirmation';

// Email data interfaces
export interface RegistrationConfirmationData {
  participantName: string;
  participantEmail: string;
  registrationReference: string;
  trainingName: string;
  trainingDate: string;
  facilityName: string;
  format: 'In-Person' | 'Virtual';
  attendingWithBaby: boolean;
  mobileNumber: string;
  fcpName: string;
  cluster: string;
  region: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  demoMode?: boolean;
}

/**
 * Email Service Class
 */
class EmailService {
  private isDemoMode: boolean;

  constructor() {
    this.isDemoMode = EMAIL_DEMO_MODE;
    
    if (this.isDemoMode) {
      console.log('📧 Email Service initialized in DEMO MODE - No actual emails will be sent');
    } else {
      console.log('📧 Email Service initialized in PRODUCTION MODE');
    }
  }

  /**
   * Check if service is in demo mode
   */
  isDemo(): boolean {
    return this.isDemoMode;
  }

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmation(data: RegistrationConfirmationData): Promise<EmailResult> {
    try {
      const emailHtml = this.generateRegistrationConfirmationHtml(data);
      const emailText = this.generateRegistrationConfirmationText(data);

      if (this.isDemoMode) {
        // Demo mode - just log and return success
        console.log('📧 [DEMO MODE] Registration confirmation email would be sent to:', data.participantEmail);
        console.log('📧 [DEMO MODE] Subject:', this.getRegistrationConfirmationSubject(data));
        console.log('📧 [DEMO MODE] Reference:', data.registrationReference);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          messageId: `demo-${Date.now()}`,
          demoMode: true,
        };
      }

      // Production mode - send actual email via Supabase Edge Function
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.participantEmail,
          from: {
            email: FROM_EMAIL,
            name: FROM_NAME,
          },
          subject: this.getRegistrationConfirmationSubject(data),
          html: emailHtml,
          text: emailText,
        },
      });

      if (error) {
        console.error('Failed to send registration confirmation email:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email',
        };
      }

      return {
        success: true,
        messageId: result?.messageId,
        demoMode: false,
      };
    } catch (error) {
      console.error('Error sending registration confirmation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate email subject for registration confirmation
   */
  private getRegistrationConfirmationSubject(data: RegistrationConfirmationData): string {
    return `Registration Confirmed: ${data.trainingName}`;
  }

  /**
   * Generate HTML email template for registration confirmation
   */
  private generateRegistrationConfirmationHtml(data: RegistrationConfirmationData): string {
    const formattedDate = new Date(data.trainingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .reference-box {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .reference-box .label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .reference-box .reference {
      font-size: 28px;
      font-weight: bold;
      color: #3b82f6;
      letter-spacing: 1px;
    }
    .info-section {
      margin: 25px 0;
    }
    .info-section h2 {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 140px;
    }
    .info-value {
      color: #1f2937;
    }
    .alert {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-success {
      background: #d1fae5;
      border-left-color: #10b981;
    }
    .next-steps {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .next-steps ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 8px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✓ Registration Confirmed</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your training registration has been successfully processed</p>
  </div>
  
  <div class="content">
    <p>Dear ${data.participantName},</p>
    
    <p>Thank you for registering for the training session. Your registration has been confirmed and we look forward to seeing you!</p>
    
    <div class="reference-box">
      <div class="label">Registration Reference Number</div>
      <div class="reference">${data.registrationReference}</div>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Please save this reference number for your records</p>
    </div>
    
    <div class="info-section">
      <h2>Training Details</h2>
      <div class="info-row">
        <div class="info-label">Training Name:</div>
        <div class="info-value">${data.trainingName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Date:</div>
        <div class="info-value">${formattedDate}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Location:</div>
        <div class="info-value">${data.facilityName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Format:</div>
        <div class="info-value">${data.format}</div>
      </div>
    </div>
    
    <div class="info-section">
      <h2>Your Information</h2>
      <div class="info-row">
        <div class="info-label">Name:</div>
        <div class="info-value">${data.participantName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Email:</div>
        <div class="info-value">${data.participantEmail}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Mobile:</div>
        <div class="info-value">${data.mobileNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">FCP:</div>
        <div class="info-value">${data.fcpName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Cluster:</div>
        <div class="info-value">${data.cluster}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Region:</div>
        <div class="info-value">${data.region}</div>
      </div>
    </div>
    
    ${data.attendingWithBaby ? `
    <div class="alert alert-success">
      <strong>Baby Attendance Confirmed</strong><br>
      Your documents have been received and will be reviewed by the trainer before the session.
    </div>
    ` : ''}
    
    ${data.format === 'In-Person' ? `
    <div class="alert">
      <strong>Important Reminder</strong><br>
      You have confirmed your attendance for this in-person training. Please ensure you arrive at least 15 minutes before the session starts.
    </div>
    ` : ''}
    
    <div class="next-steps">
      <h3 style="margin-top: 0;">Next Steps</h3>
      <ul>
        <li><strong>Save Your Reference:</strong> Keep your registration reference number (${data.registrationReference}) for future correspondence.</li>
        <li><strong>Calendar Reminder:</strong> Add the training date to your calendar to ensure you don't miss it.</li>
        ${data.format === 'In-Person' ? '<li><strong>Arrival Time:</strong> Please arrive at least 15 minutes before the training starts.</li>' : ''}
        ${data.format === 'Virtual' ? '<li><strong>Virtual Link:</strong> You will receive the virtual meeting link 24 hours before the training.</li>' : ''}
        <li><strong>Questions:</strong> If you have any questions, please contact the trainer who shared the registration link with you.</li>
      </ul>
    </div>
    
    <p>We look forward to seeing you at the training!</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>Training Portal Team</strong>
    </p>
  </div>
  
  <div class="footer">
    <p>This is an automated confirmation email. Please do not reply to this email.</p>
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Training Portal. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text email template for registration confirmation
   */
  private generateRegistrationConfirmationText(data: RegistrationConfirmationData): string {
    const formattedDate = new Date(data.trainingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
REGISTRATION CONFIRMED

Dear ${data.participantName},

Thank you for registering for the training session. Your registration has been confirmed and we look forward to seeing you!

REGISTRATION REFERENCE NUMBER: ${data.registrationReference}
Please save this reference number for your records.

TRAINING DETAILS
----------------
Training Name: ${data.trainingName}
Date: ${formattedDate}
Location: ${data.facilityName}
Format: ${data.format}

YOUR INFORMATION
----------------
Name: ${data.participantName}
Email: ${data.participantEmail}
Mobile: ${data.mobileNumber}
FCP: ${data.fcpName}
Cluster: ${data.cluster}
Region: ${data.region}

${data.attendingWithBaby ? `
BABY ATTENDANCE CONFIRMED
Your documents have been received and will be reviewed by the trainer before the session.
` : ''}

${data.format === 'In-Person' ? `
IMPORTANT REMINDER
You have confirmed your attendance for this in-person training. Please ensure you arrive at least 15 minutes before the session starts.
` : ''}

NEXT STEPS
----------
- Save Your Reference: Keep your registration reference number (${data.registrationReference}) for future correspondence.
- Calendar Reminder: Add the training date to your calendar to ensure you don't miss it.
${data.format === 'In-Person' ? '- Arrival Time: Please arrive at least 15 minutes before the training starts.' : ''}
${data.format === 'Virtual' ? '- Virtual Link: You will receive the virtual meeting link 24 hours before the training.' : ''}
- Questions: If you have any questions, please contact the trainer who shared the registration link with you.

We look forward to seeing you at the training!

Best regards,
Training Portal Team

---
This is an automated confirmation email. Please do not reply to this email.
© ${new Date().getFullYear()} Training Portal. All rights reserved.
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();
