# Email Demo Mode Guide

## Quick Start

The email notification system is currently in **DEMO MODE**, which means no actual emails are sent. This is perfect for prototyping and testing!

## How Demo Mode Works

### 1. What You'll See

When a participant completes registration:

**In the Browser:**
- Success page displays normally
- Yellow alert box indicates demo mode
- Message says: "Demo Mode: Email notifications are currently disabled"

**In the Console (Developer Tools):**
```
📧 Email Service initialized in DEMO MODE - No actual emails will be sent
📧 [DEMO MODE] Registration confirmation email would be sent to: participant@example.com
📧 [DEMO MODE] Subject: Registration Confirmed: Child Development Training
📧 [DEMO MODE] Reference: REG-20260218-ABC12
✅ Demo email logged successfully
```

### 2. Testing the Email System

To see what emails would look like:

1. **Open Developer Console:**
   - Chrome/Edge: Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
   - Firefox: Press F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
   - Safari: Enable Developer Menu, then press Cmd+Option+C

2. **Complete a Registration:**
   - Fill out the registration form
   - Submit the form
   - Watch the console for email logs

3. **Review Email Details:**
   - Recipient email address
   - Email subject
   - Registration reference
   - All email content is logged

### 3. What's Included in the Email

The confirmation email includes:

✅ **Registration Reference Number** (prominently displayed)
✅ **Training Details:**
   - Training name
   - Date and time
   - Location/facility
   - Format (In-Person or Virtual)

✅ **Participant Information:**
   - Name
   - Email
   - Mobile number
   - FCP details
   - Cluster and region

✅ **Next Steps:**
   - Save reference number
   - Add to calendar
   - Arrival instructions (for in-person)
   - Virtual link notice (for virtual)
   - Contact information

✅ **Conditional Content:**
   - Baby attendance confirmation (if applicable)
   - In-person commitment reminder (if applicable)

## Switching to Production Mode

When you're ready to send real emails:

### Step 1: Choose an Email Provider

Recommended options:
- **Resend** (easiest, modern API)
- **SendGrid** (established, feature-rich)
- **AWS SES** (cost-effective, scalable)
- **Postmark** (excellent deliverability)

### Step 2: Set Up Supabase Edge Function

Create `supabase/functions/send-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, from, subject, html, text } = await req.json()
  
  // Example with Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${from.name} <${from.email}>`,
      to: [to],
      subject,
      html,
      text,
    }),
  })
  
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Step 3: Update Environment Variables

In your `.env` file:

```bash
# Switch to production mode
VITE_EMAIL_DEMO_MODE=false

# Configure sender details
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Your Organization Name
```

### Step 4: Test in Staging

1. Deploy to staging environment
2. Complete a test registration
3. Check that email arrives
4. Verify all content is correct
5. Test spam folder placement

### Step 5: Deploy to Production

1. Update production environment variables
2. Deploy the application
3. Monitor email delivery
4. Check error logs

## Troubleshooting

### Demo Mode Not Working?

**Check Console:**
- Open developer tools
- Look for the 📧 emoji in console logs
- Verify "DEMO MODE" appears in logs

**Verify Environment:**
```bash
# Should be true or not set
echo $VITE_EMAIL_DEMO_MODE
```

### Want to See Email HTML?

The email HTML is generated but not displayed in demo mode. To see it:

1. Add a temporary console.log in `emailService.ts`:
```typescript
const emailHtml = this.generateRegistrationConfirmationHtml(data);
console.log('Email HTML:', emailHtml); // Add this line
```

2. Copy the HTML from console
3. Save to a `.html` file
4. Open in browser to preview

### Testing Different Scenarios

**In-Person Training:**
- Creates registration with format: "In-Person"
- Email includes arrival time reminder
- Shows commitment message

**Virtual Training:**
- Creates registration with format: "Virtual"
- Email includes virtual link notice
- No arrival time reminder

**With Baby:**
- Select "Yes" for baby attendance
- Upload required documents
- Email includes baby attendance confirmation

**Without Baby:**
- Select "No" for baby attendance
- Email doesn't include baby section

## Benefits of Demo Mode

✅ **No Setup Required:** Start testing immediately
✅ **No Costs:** No email sending fees during development
✅ **Fast Feedback:** See results instantly in console
✅ **Easy Debugging:** All email details logged
✅ **Realistic UX:** Simulated delay for authentic experience
✅ **Safe Testing:** No risk of sending test emails to real users

## FAQ

**Q: Will participants receive emails in demo mode?**
A: No, no actual emails are sent. Only console logs are generated.

**Q: How do I know if demo mode is active?**
A: Check the console for "DEMO MODE" messages and look for the yellow alert on the success page.

**Q: Can I test the email templates?**
A: Yes, the templates are fully generated. You can log the HTML to console and preview it in a browser.

**Q: When should I switch to production mode?**
A: When you have:
- Chosen an email provider
- Set up the Supabase Edge Function
- Tested in a staging environment
- Configured your domain email

**Q: What happens if email fails in production?**
A: The registration still succeeds. Email failures are logged but don't prevent registration completion.

**Q: Can I switch back to demo mode?**
A: Yes, just set `VITE_EMAIL_DEMO_MODE=true` in your `.env` file.

## Support

For issues or questions:
1. Check the console logs for error messages
2. Review the implementation documentation
3. Verify environment variables are set correctly
4. Check that the email service is properly imported

## Next Steps

Continue prototyping with demo mode, then follow the production setup guide when ready to deploy!
