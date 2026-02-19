# Registration Module - User Guide 📋

This guide shows you how to use the participant self-registration feature.

## Overview

The registration module allows trainers to generate unique registration links for training sessions, which participants can use to self-register.

## For Trainers: Generating Registration Links

### Step 1: Access the Application

1. Open your browser and go to: **http://localhost:8080/**
2. You'll see the Training Management System dashboard

### Step 2: Navigate to Training Sessions

1. Look for the **Training Sessions** section in the navigation
2. Click on a training session to view its details
3. Or create a new training session if needed

### Step 3: Generate a Registration Link

1. In the training session details page, look for the **"Generate Registration Link"** button
2. Click the button
3. A unique registration link will be generated
4. The link format will be: `http://localhost:8080/register/[unique-token]`

### Step 4: Share the Link

You can share the link with participants via:
- ✉️ Email
- 💬 WhatsApp/SMS
- 📱 Social media
- 📄 Printed materials

**Example link:**
```
http://localhost:8080/register/abc123xyz789
```

### Step 5: Copy the Link

1. Click the **"Copy Link"** button next to the generated link
2. The link is now in your clipboard
3. Paste it wherever you need to share it

### Step 6: View Registrations

1. Go back to the training session details
2. You'll see a list of registered participants
3. View their details including:
   - Name
   - Email
   - Mobile number
   - Position
   - FCP information
   - Registration date

---

## For Participants: Self-Registration

### Step 1: Receive the Registration Link

You'll receive a unique registration link from your trainer via email, SMS, or other channels.

**Example:**
```
http://localhost:8080/register/abc123xyz789
```

### Step 2: Open the Link

1. Click on the link or copy-paste it into your browser
2. The registration form will load automatically
3. You'll see the training session details at the top

### Step 3: Fill Out the Registration Form

The form has two sections:

#### Personal Information
- **Full Name** * (required)
- **Mobile Number** * (required)
- **Email Address** * (required)
- **Position** * (required)

#### FCP Information
- **FCP Number** * (required)
- **FCP Name** * (required)
- **Cluster** * (required)
- **Region** * (required)

**Tips:**
- All fields marked with * are required
- Email must be in valid format (e.g., name@example.com)
- Mobile number can include country code (e.g., +254712345678)
- Form validates in real-time as you type

### Step 4: Submit the Form

1. Review all your information
2. Click **"Continue to Next Step"** button
3. The system will check for duplicate registrations
4. If successful, you'll see a confirmation message

### Step 5: Confirmation

After successful registration:
- ✅ Your registration is saved in the database
- ✅ The trainer can see your registration
- ✅ You'll receive confirmation (in future updates)

---

## Testing the Registration Flow

### Quick Test (5 minutes)

1. **Create Test Data** (if needed):
   - Go to your Supabase dashboard
   - Use the SQL Editor to insert test data
   - Or use the application to create a training session

2. **Generate a Link**:
   ```
   Navigate to: http://localhost:8080/
   → Find a training session
   → Click "Generate Registration Link"
   → Copy the link
   ```

3. **Test Registration**:
   ```
   Open the copied link in a new browser tab
   Fill out the form with test data:
   - Name: John Doe
   - Mobile: +254712345678
   - Email: john.doe@example.com
   - Position: Program Officer
   - FCP Number: FCP001
   - FCP Name: Test FCP
   - Cluster: North Cluster
   - Region: North
   
   Click "Continue to Next Step"
   ```

4. **Verify in Database**:
   ```
   Go to Supabase Dashboard
   → Table Editor
   → participant_registrations table
   → You should see your test registration
   ```

---

## Features

### ✅ Real-time Validation

The form validates your input as you type:
- **Email format**: Must be valid email (name@domain.com)
- **Mobile number**: Accepts various formats (+254..., 0712...)
- **Required fields**: Shows error if left empty
- **Name length**: Must be at least 2 characters

### ✅ Duplicate Prevention

The system prevents duplicate registrations:
- Checks if email is already registered for this session
- Shows clear error message if duplicate found
- Suggests checking your email for confirmation

### ✅ Secure Access

Registration links are secure:
- Unique token for each training session
- Token validation before showing form
- Expired links show error message
- Invalid tokens are rejected

### ✅ User-Friendly Interface

- Clean, modern design
- Mobile-responsive (works on phones)
- Clear error messages
- Loading states during submission
- Training session details displayed

---

## Common Scenarios

### Scenario 1: Trainer Generates Link for Workshop

```
1. Trainer creates training session: "Child Protection Workshop"
2. Trainer clicks "Generate Registration Link"
3. Trainer copies link: http://localhost:8080/register/xyz789
4. Trainer sends link via email to 50 participants
5. Participants click link and register
6. Trainer views all 50 registrations in dashboard
```

### Scenario 2: Participant Registers for Training

```
1. Participant receives email with registration link
2. Participant clicks link on mobile phone
3. Form opens with training details
4. Participant fills out all required fields
5. Participant submits form
6. Confirmation message appears
7. Participant's data is saved in system
```

### Scenario 3: Duplicate Registration Attempt

```
1. Participant registers successfully
2. Participant tries to register again with same email
3. System detects duplicate
4. Error message: "You have already registered..."
5. Participant is reminded to check email for confirmation
```

---

## Troubleshooting

### "Registration link is invalid or has expired"

**Cause:** The link token is invalid or the link has expired.

**Solution:**
- Contact the trainer for a new link
- Verify you copied the complete link
- Check if the link has an expiration date

### "You have already registered for this training session"

**Cause:** Your email is already registered for this session.

**Solution:**
- Check your email for confirmation
- Contact the trainer if you need to update your information
- Use a different email if you're registering someone else

### "Please enter a valid email address"

**Cause:** Email format is incorrect.

**Solution:**
- Use format: name@domain.com
- No spaces or special characters
- Must have @ and domain extension

### "Please enter a valid mobile number"

**Cause:** Mobile number format is incorrect.

**Solution:**
- Use digits only (with optional +, spaces, dashes)
- Examples: +254712345678, 0712345678, 254-712-345678

### Form won't submit

**Checklist:**
- ✅ All required fields filled out
- ✅ Email format is valid
- ✅ Mobile number format is valid
- ✅ No duplicate registration
- ✅ Internet connection is active

---

## Database Structure

For reference, here's what gets saved when you register:

```
participant_registrations table:
├── id (auto-generated)
├── registration_link_id (link used)
├── training_session_id (session ID)
├── participant_name (your name)
├── mobile_number (your phone)
├── email_address (your email)
├── participant_position (your role)
├── fcp_number (FCP number)
├── fcp_name (FCP name)
├── cluster (your cluster)
├── region (your region)
├── registration_reference (unique ref)
├── registered_at (timestamp)
└── ... (other fields)
```

---

## API Endpoints (For Developers)

The registration module uses these Supabase operations:

```typescript
// Generate registration link
registrationLinkService.generateLink(sessionId, userId, expiresAt)

// Validate registration link
registrationLinkService.validateLink(token)

// Check duplicate registration
databaseService.getRegistrationByEmail(email, sessionId)

// Create registration
databaseService.createParticipantRegistration(data)
```

---

## Next Features (Coming Soon)

🚧 **In Development:**
- Document upload (nanny approval, waivers)
- Baby attendance question
- Email confirmation
- SMS notifications
- Registration editing
- QR code generation
- Bulk link generation
- Registration reports

---

## Support

### For Trainers
- Check the training session dashboard for registrations
- View participant details in the session page
- Export registration data (coming soon)

### For Participants
- Contact your trainer if you have issues
- Keep your registration confirmation email
- Arrive on time for the training session

### For Developers
- Check browser console for errors
- Review Supabase logs for database issues
- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for configuration

---

## Quick Reference

### URLs
- **Dashboard:** http://localhost:8080/
- **Registration:** http://localhost:8080/register/[token]

### Key Files
- `src/pages/PublicRegistration.tsx` - Registration form
- `src/lib/registrationLinkService.ts` - Link generation
- `src/lib/database.ts` - Database operations
- `src/components/sessions/RegistrationLinkGenerator.tsx` - Link UI

### Database Tables
- `registration_links` - Generated links
- `participant_registrations` - Registration data
- `training_sessions` - Training sessions
- `link_analytics` - Link statistics

---

**Happy Training! 🎓**

For more help, see:
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Full setup instructions
