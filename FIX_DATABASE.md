# Fix: "relation registration_links does not exist" 🔧

## Problem
The `registration_links` table doesn't exist in your Supabase database.

## Solution

### Step 1: Verify Current Tables

1. Go to your **Supabase Dashboard**
2. Click on **Table Editor** (left sidebar)
3. Check if you see these tables:
   - `users`
   - `training_sessions`
   - `registration_links` ← This one is missing!

### Step 2: Run the Registration System Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the ENTIRE contents of `src/lib/migrations/001_registration_system.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Wait for "Success. No rows returned" message

### Step 3: Verify Tables Were Created

Go back to **Table Editor** and verify these new tables exist:
- ✅ `registration_links`
- ✅ `participant_registrations`
- ✅ `uploaded_documents`
- ✅ `link_analytics`

### Step 4: Test Again

1. Refresh your browser at http://localhost:8080/
2. Try generating a registration link again
3. It should work now!

---

## If You Still Get Errors

### Error: "relation training_sessions does not exist"

This means you need to run the base schema first:

1. Go to **SQL Editor**
2. Run `src/lib/migrations/000_base_schema.sql` FIRST
3. Then run `src/lib/migrations/001_registration_system.sql`

### Error: "permission denied"

1. Check you're using the correct Supabase project
2. Verify your credentials in `.env` file
3. Make sure you're logged in as project owner

### Error: "duplicate key value"

This is OK - it means the table already exists. You can ignore this.

---

## Quick Fix SQL (Copy-Paste This)

If you want a quick fix, run this in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'registration_links'
);

-- If it returns 'false', the table doesn't exist
-- Run the full migration from 001_registration_system.sql
```

---

## Prevention

To avoid this in the future:
1. Always run migrations in order (000, 001, 002, etc.)
2. Check for success messages after running SQL
3. Verify tables in Table Editor after migrations
4. Keep a backup of your database

---

**After fixing, refresh your browser and try again!** 🚀
