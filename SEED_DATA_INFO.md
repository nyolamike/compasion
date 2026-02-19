# Seed Data Information 📊

## Overview

The seed data creates a complete test environment with users, training sessions, and sample data.

## How to Load Seed Data

1. Go to your **Supabase Dashboard**
2. Open **SQL Editor**
3. Click **New Query**
4. Copy the contents of `src/lib/migrations/002_seed_data.sql`
5. Paste and click **Run**
6. Wait for "Success" message

## What Gets Created

### 👥 Users (4 total)

| Name | Email | Role | Regions | Specializations |
|------|-------|------|---------|-----------------|
| **John Kamau** | john.kamau@example.com | Facilitator | Nairobi, Central | Child Protection, Safeguarding, Training of Trainers |
| **Brenda Wanjiku** | brenda.wanjiku@example.com | Facilitator | Nairobi, Coast | Child Development, Nutrition, Health & Safety |
| David Omondi | david.omondi@example.com | Coordinator | Nairobi, Western | Program Management, M&E |
| Sarah Njeri | sarah.njeri@example.com | Manager | Nairobi | Strategic Planning, Resource Management |

### 🏢 Facilities (4 total)

- **Nairobi Training Center** (Hotel, 50 capacity)
- **Mombasa Conference Hall** (Hotel, 80 capacity)
- **Zoom Virtual Platform** (Online, 200 capacity)
- **Kisumu Training Hall** (Hotel, 40 capacity)

### 👨‍👩‍👧‍👦 Participants (5 total)

- Mary Akinyi (FCP Coordinator, Nairobi)
- Peter Mwangi (Program Officer, Central)
- Grace Wambui (Field Officer, Coast)
- James Otieno (FCP Manager, Western)
- Lucy Njoki (Social Worker, Nairobi)

### 📚 Training Plans (3 total)

1. **Child Protection and Safeguarding Training** (by John)
   - In-Person, Nairobi
   - 25 participants
   - Status: Approved

2. **Child Nutrition and Health Training** (by Brenda)
   - In-Person, Coast
   - 30 participants
   - Status: Approved

3. **Monitoring and Evaluation for FCP Programs** (by John)
   - Virtual/Zoom
   - 50 participants
   - Status: Approved

### 📅 Training Sessions (5 total)

#### Upcoming Sessions:

1. **Child Protection Day 1** (John)
   - Date: 7 days from now
   - Location: Nairobi Training Center
   - Format: In-Person
   - Status: Scheduled

2. **Child Protection Day 2** (John)
   - Date: 8 days from now
   - Location: Nairobi Training Center
   - Format: In-Person
   - Status: Scheduled

3. **Child Nutrition Day 1** (Brenda)
   - Date: 14 days from now
   - Location: Mombasa Conference Hall
   - Format: In-Person
   - Status: Scheduled

4. **M&E Workshop** (John)
   - Date: 21 days from now
   - Location: Zoom Virtual Platform
   - Format: Virtual
   - Status: Scheduled

#### Past Sessions:

5. **Child Protection Refresher** (John)
   - Date: 30 days ago
   - Status: Completed

### 📄 Training Materials (4 total)

- Child Protection Guidelines (Presentation)
- Safeguarding Policy Handbook (Handout)
- Nutrition Assessment Tools (Presentation)
- Child Development Milestones Chart (Handout)

## Testing the Registration Module

After loading seed data, you can test with these sessions:

### Test 1: John's Child Protection Training
```
Session: Child Protection Day 1
Facilitator: John Kamau
Date: 7 days from now
Location: Nairobi Training Center
```

**To test:**
1. Navigate to this session in the app
2. Click "Generate Registration Link"
3. Copy and share the link
4. Open link and register as a participant

### Test 2: Brenda's Nutrition Training
```
Session: Child Nutrition Day 1
Facilitator: Brenda Wanjiku
Date: 14 days from now
Location: Mombasa Conference Hall
```

**To test:**
1. Navigate to this session
2. Generate registration link
3. Test the registration form

### Test 3: John's Virtual M&E Training
```
Session: M&E Workshop
Facilitator: John Kamau
Date: 21 days from now
Location: Zoom (Virtual)
```

**To test:**
1. Generate link for virtual session
2. Verify virtual format displays correctly
3. Test registration process

## Quick Queries

### View all users:
```sql
SELECT name, email, role FROM users ORDER BY name;
```

### View upcoming sessions:
```sql
SELECT 
  training_name,
  session_date,
  facilitator_name,
  format,
  status
FROM training_sessions
WHERE session_date >= CURRENT_DATE
ORDER BY session_date;
```

### View John's sessions:
```sql
SELECT 
  training_name,
  session_date,
  format,
  status
FROM training_sessions
WHERE facilitator_name = 'John Kamau'
ORDER BY session_date;
```

### View Brenda's sessions:
```sql
SELECT 
  training_name,
  session_date,
  format,
  status
FROM training_sessions
WHERE facilitator_name = 'Brenda Wanjiku'
ORDER BY session_date;
```

## User Credentials

For testing purposes, you can use these email addresses:

**Facilitators:**
- john.kamau@example.com (John)
- brenda.wanjiku@example.com (Brenda)

**Coordinators:**
- david.omondi@example.com (David)

**Managers:**
- sarah.njeri@example.com (Sarah)

**Note:** This is test data. In production, you'll need proper authentication.

## Resetting Seed Data

If you need to reset and reload:

```sql
-- Clear existing data (careful!)
TRUNCATE training_materials CASCADE;
TRUNCATE training_sessions CASCADE;
TRUNCATE training_plans CASCADE;
TRUNCATE participants CASCADE;
TRUNCATE facilities CASCADE;
TRUNCATE users CASCADE;

-- Then re-run 002_seed_data.sql
```

## Next Steps

After loading seed data:

1. ✅ Restart your dev server: `npm run dev`
2. ✅ Open http://localhost:8080/
3. ✅ Navigate to training sessions
4. ✅ Find John's or Brenda's sessions
5. ✅ Generate registration links
6. ✅ Test the registration flow

## Customization

You can modify the seed data by editing `002_seed_data.sql`:

- Add more users
- Create additional training sessions
- Change dates
- Add more facilities
- Customize participant data

Just re-run the SQL after making changes!

---

**Ready to test? Load the seed data and start generating registration links!** 🚀
