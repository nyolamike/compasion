# Database Setup Checklist

This guide helps you set up the database for the Training Management System.

## Overview

The system uses **Supabase** (PostgreSQL) as the database. You have two options:

1. **Use the existing shared database** (already configured)
2. **Set up your own Supabase instance** (recommended for production)

---

## Option 1: Use Existing Database (Easiest)

✅ **No setup required!** The project is already configured with a working Supabase instance.

**Credentials are in:** `src/lib/supabase.ts`

Just run:
```bash
npm install
npm run dev
```

**Note:** This is a shared development database. Don't use it for production or sensitive data.

---

## Option 2: Set Up Your Own Supabase Instance

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** Training Management System
   - **Database Password:** (choose a strong password)
   - **Region:** (choose closest to you)
5. Click "Create new project"
6. Wait 2-3 minutes for initialization

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 3: Configure Your Project

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Run Database Migrations

You need to create the database schema. There are two migration files to run **in order**:

#### Migration 1: Base Schema (Required)

This creates all the core tables (users, training sessions, etc.)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `src/lib/migrations/000_base_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. ✅ Verify: You should see "Success. No rows returned"

#### Migration 2: Registration System (Required)

This adds the registration link and participant registration tables.

1. In SQL Editor, click **New Query**
2. Copy the contents of `src/lib/migrations/001_registration_system.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. ✅ Verify: You should see "Success. No rows returned"

### Step 5: Verify Tables Were Created

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ users
   - ✅ participants
   - ✅ training_sessions
   - ✅ training_plans
   - ✅ facilities
   - ✅ registration_links
   - ✅ participant_registrations
   - ✅ uploaded_documents
   - ✅ link_analytics
   - (and more...)

### Step 6: Test the Connection

```bash
npm run dev
```

Open the browser console and check for any database connection errors.

---

## Database Schema Overview

### Core Tables (from 000_base_schema.sql)

| Table | Description |
|-------|-------------|
| `users` | System users (trainers, administrators) |
| `participants` | Training participants |
| `training_plans` | Training plans and curricula |
| `training_sessions` | Scheduled training sessions |
| `facilities` | Training venues (physical/virtual) |
| `attendance_records` | Session attendance tracking |
| `evaluations` | Participant performance evaluations |
| `feedback` | Session feedback from participants |
| `survey_templates` | Pre/post training surveys |
| `survey_responses` | Survey responses |

### Registration System Tables (from 001_registration_system.sql)

| Table | Description |
|-------|-------------|
| `registration_links` | Unique registration links for sessions |
| `participant_registrations` | Self-registration data |
| `uploaded_documents` | Documents uploaded during registration |
| `link_analytics` | Analytics for registration links |

---

## Troubleshooting

### Error: "relation does not exist"

**Cause:** Tables haven't been created yet.

**Solution:** Run the migration files in the SQL Editor.

### Error: "permission denied for table"

**Cause:** Row Level Security (RLS) might be enabled.

**Solution:** 
1. Go to **Authentication** > **Policies**
2. For development, you can disable RLS on tables
3. For production, set up proper RLS policies

### Error: "duplicate key value violates unique constraint"

**Cause:** Trying to insert data that already exists.

**Solution:** This is normal if you're re-running migrations. You can ignore it or clear the tables first.

### Can't connect to Supabase

**Checklist:**
- ✅ Is your Supabase project active? (check dashboard)
- ✅ Are your credentials correct in `.env`?
- ✅ Is your internet connection working?
- ✅ Check browser console for specific error messages

---

## Seed Data (Optional)

The base schema includes some test data:
- A test facilitator user
- A test training facility

You can add more test data by running SQL queries in the SQL Editor.

### Example: Add a Test Training Session

```sql
-- First, get the IDs you need
SELECT id, name FROM users WHERE role = 'facilitator' LIMIT 1;
SELECT id, name FROM facilities LIMIT 1;

-- Then create a training plan
INSERT INTO training_plans (
  title, objectives, methodologies, start_date, end_date,
  status, region, training_type, created_by
) VALUES (
  'Test Training Plan',
  'Learn basic concepts',
  'Interactive workshops',
  '2024-03-01',
  '2024-03-05',
  'approved',
  'North',
  'In-Person',
  'user-id-from-above'
) RETURNING id;

-- Finally, create a training session
INSERT INTO training_sessions (
  training_plan_id, training_name, facility_id, facility_name,
  session_date, format, facilitator_id, facilitator_name, status
) VALUES (
  'plan-id-from-above',
  'Introduction to Child Protection',
  'facility-id-from-above',
  'Test Training Center',
  '2024-03-15',
  'In-Person',
  'user-id-from-above',
  'Test Facilitator',
  'scheduled'
);
```

---

## Security Best Practices

### For Development
- ✅ Use the shared database or your own test instance
- ✅ Don't store sensitive data
- ✅ Keep your `.env` file in `.gitignore`

### For Production
- ✅ Use a separate Supabase project
- ✅ Enable Row Level Security (RLS)
- ✅ Set up proper authentication
- ✅ Use environment variables for credentials
- ✅ Enable database backups
- ✅ Monitor database usage

---

## Next Steps

After setting up the database:

1. ✅ Run `npm run dev` to start the application
2. ✅ Test the registration flow
3. ✅ Continue with Task 6 (document uploads)
4. ✅ Set up authentication for production

---

## Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Backups](https://supabase.com/docs/guides/platform/backups)

---

**Need help?** Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more details.
