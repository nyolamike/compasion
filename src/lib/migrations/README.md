# Database Migrations

This directory contains SQL migration scripts for the database schema.

## Registration System Migration

The `001_registration_system.sql` file contains the schema for the participant self-registration feature.

### Tables Created

1. **registration_links** - Stores unique registration links for training sessions
2. **participant_registrations** - Stores participant self-registration data
3. **uploaded_documents** - Stores documents uploaded during registration
4. **link_analytics** - Tracks analytics for registration links

### How to Apply

#### Using Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `001_registration_system.sql`
4. Paste into the SQL Editor and run the script

#### Using Supabase CLI

```bash
supabase db push
```

Or manually execute:

```bash
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f src/lib/migrations/001_registration_system.sql
```

### Prerequisites

The migration assumes the following tables already exist:
- `training_sessions`
- `users`

### Features

- Automatic timestamp updates via triggers
- Indexes for optimized queries
- Foreign key constraints for data integrity
- Unique constraints to prevent duplicate registrations
- Check constraints for data validation
