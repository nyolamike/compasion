# Quick Demo - Registration Module 🚀

## 5-Minute Walkthrough

### What You'll Do
1. ✅ Access the application
2. ✅ Generate a registration link
3. ✅ Test the registration form
4. ✅ Verify the data in database

---

## Step-by-Step Demo

### 1️⃣ Open the Application

```bash
# Make sure the server is running
npm run dev
```

Open your browser: **http://localhost:8080/**

---

### 2️⃣ Navigate to Training Sessions

Currently, the app shows the main dashboard. To test the registration module, you need to:

**Option A: Use the UI (if training sessions are visible)**
- Look for "Training Sessions" in the navigation
- Click on a session
- Find the "Generate Registration Link" button

**Option B: Create Test Data First**

If you don't see any training sessions, you need to add test data to your database:

1. Go to your **Supabase Dashboard**
2. Open **SQL Editor**
3. Run this query to create a test session:

```sql
-- First, create a test user (if not exists)
INSERT INTO users (name, email, role, regions, specializations) 
VALUES ('Test Trainer', 'trainer@test.com', 'facilitator', ARRAY['North'], ARRAY['Training'])
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Create a test facility (if not exists)
INSERT INTO facilities (name, type, capacity, equipment, region) 
VALUES ('Test Center', 'Hotel Facility', 50, ARRAY['Projector'], 'North')
RETURNING id;

-- Create a test training plan
INSERT INTO training_plans (
  title, objectives, methodologies, start_date, end_date,
  status, region, training_type, created_by
) VALUES (
  'Child Protection Training',
  'Learn child protection basics',
  'Interactive workshops',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '5 days',
  'approved',
  'North',
  'In-Person',
  (SELECT id FROM users WHERE email = 'trainer@test.com' LIMIT 1)
) RETURNING id;

-- Create a test training session
INSERT INTO training_sessions (
  training_plan_id,
  training_name,
  facility_id,
  facility_name,
  session_date,
  format,
  facilitator_id,
  facilitator_name,
  status
) VALUES (
  (SELECT id FROM training_plans WHERE title = 'Child Protection Training' LIMIT 1),
  'Introduction to Child Protection',
  (SELECT id FROM facilities WHERE name = 'Test Center' LIMIT 1),
  'Test Center',
  CURRENT_DATE + INTERVAL '7 days',
  'In-Person',
  (SELECT id FROM users WHERE email = 'trainer@test.com' LIMIT 1),
  'Test Trainer',
  'scheduled'
) RETURNING id;
```

---

### 3️⃣ Generate a Registration Link

**Method 1: Using the UI Component**

If you have the `RegistrationLinkGenerator` component visible:
1. Click "Generate Registration Link"
2. Copy the generated link
3. It will look like: `http://localhost:8080/register/abc123xyz789`

**Method 2: Using SQL (Quick Test)**

Run this in Supabase SQL Editor:

```sql
-- Generate a test registration link
INSERT INTO registration_links (
  training_session_id,
  token,
  is_active,
  expires_at,
  created_by
) VALUES (
  (SELECT id FROM training_sessions LIMIT 1),
  'test-token-' || substr(md5(random()::text), 1, 16),
  true,
  NOW() + INTERVAL '30 days',
  (SELECT id FROM users LIMIT 1)
) RETURNING 
  'http://localhost:8080/register/' || token as registration_url;
```

Copy the URL from the result!

---

### 4️⃣ Test the Registration Form

1. **Open the registration link** in a new browser tab
   ```
   http://localhost:8080/register/[your-token]
   ```

2. **You should see:**
   - Training session details (name, date, location)
   - Registration form with all fields
   - "Continue to Next Step" button

3. **Fill out the form:**
   ```
   Personal Information:
   - Full Name: John Doe
   - Mobile Number: +254712345678
   - Email Address: john.doe@example.com
   - Position: Program Officer

   FCP Information:
   - FCP Number: FCP001
   - FCP Name: Test FCP Center
   - Cluster: North Cluster
   - Region: North Region
   ```

4. **Submit the form:**
   - Click "Continue to Next Step"
   - Wait for validation
   - You should see a success message (currently shows alert)

---

### 5️⃣ Verify in Database

1. Go to **Supabase Dashboard**
2. Open **Table Editor**
3. Select **participant_registrations** table
4. You should see your test registration with all the data you entered!

---

## Quick Test Checklist

Use this checklist to verify everything works:

### ✅ Link Generation
- [ ] Can generate a registration link
- [ ] Link has unique token
- [ ] Link is saved in `registration_links` table
- [ ] Link can be copied to clipboard

### ✅ Link Validation
- [ ] Valid link opens registration form
- [ ] Invalid token shows error message
- [ ] Expired link shows error message
- [ ] Training session details display correctly

### ✅ Form Validation
- [ ] Required fields show error when empty
- [ ] Email validation works (try: "invalid-email")
- [ ] Mobile validation works (try: "abc123")
- [ ] Errors clear when typing
- [ ] Errors show on blur (when leaving field)

### ✅ Duplicate Prevention
- [ ] First registration succeeds
- [ ] Second registration with same email shows error
- [ ] Error message is clear and helpful

### ✅ Data Persistence
- [ ] Registration saves to database
- [ ] All fields are saved correctly
- [ ] Timestamps are set automatically
- [ ] Registration reference is generated

---

## Common Test Scenarios

### Test 1: Happy Path ✅
```
1. Generate link → Success
2. Open link → Form loads
3. Fill form → Validation passes
4. Submit → Registration saved
5. Check database → Data is there
```

### Test 2: Invalid Email ❌
```
1. Open registration link
2. Enter email: "notanemail"
3. Try to submit
4. See error: "Please enter a valid email address"
5. Fix email → Error clears
```

### Test 3: Duplicate Registration ❌
```
1. Register with email: test@example.com → Success
2. Try to register again with same email
3. See error: "You have already registered..."
4. Cannot submit duplicate
```

### Test 4: Invalid Link ❌
```
1. Open: http://localhost:8080/register/invalid-token
2. See error: "Registration link is invalid or has expired"
3. Cannot access form
```

---

## Troubleshooting Quick Fixes

### "No training sessions found"
```sql
-- Run the test data SQL from Step 2 above
```

### "Cannot generate link"
```
Check browser console for errors
Verify Supabase connection
Check registration_links table exists
```

### "Form won't submit"
```
1. Check all required fields are filled
2. Verify email format is correct
3. Check mobile number format
4. Look at browser console for errors
```

### "Database error"
```
1. Check Supabase dashboard is accessible
2. Verify tables exist (run migrations)
3. Check .env file has correct credentials
4. Look at Supabase logs for details
```

---

## Next Steps After Demo

Once you've verified everything works:

1. **Customize the form** (if needed)
   - Edit `src/pages/PublicRegistration.tsx`
   - Add/remove fields
   - Change validation rules

2. **Style the interface**
   - Modify TailwindCSS classes
   - Update colors and spacing
   - Add your organization's branding

3. **Continue with Task 6**
   - Add document upload functionality
   - Implement baby attendance question
   - Add file validation

4. **Set up email notifications**
   - Configure email service
   - Send confirmation emails
   - Notify trainers of new registrations

---

## Demo Video Script (For Recording)

If you want to record a demo:

```
[00:00] "Hi, I'm going to show you the registration module"
[00:10] "First, I'll generate a registration link"
[00:20] "Here's the unique link - I'll copy it"
[00:30] "Now I'll open it in a new tab"
[00:40] "You can see the training session details"
[00:50] "Let me fill out the registration form"
[01:10] "All fields are validated in real-time"
[01:20] "Now I'll submit the form"
[01:30] "Success! The registration is saved"
[01:40] "Let me verify in the database"
[01:50] "Here's the registration data - all saved correctly"
[02:00] "That's how easy it is to use!"
```

---

## Performance Benchmarks

Expected performance:
- ⚡ Link generation: < 500ms
- ⚡ Form load: < 1s
- ⚡ Validation: Real-time (< 100ms)
- ⚡ Submission: < 2s
- ⚡ Database query: < 500ms

---

**Ready to try it? Start with Step 1! 🎯**

For more details, see [USER_GUIDE.md](USER_GUIDE.md)
