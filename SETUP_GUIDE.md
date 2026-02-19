# Local Development Setup Guide

This guide will help you set up and run the Training Management System locally.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager (comes with Node.js)
- **Git** (optional, for version control)

## Project Overview

This is a React + TypeScript + Vite application that uses:
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL database with REST API)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`.

### 2. Database Setup (Supabase)

The project is currently configured to use a Supabase instance. You have two options:

#### Option A: Use the Existing Supabase Instance (Easiest)

The project already has Supabase credentials configured in `src/lib/supabase.ts`. You can use this for development, but note that this is a shared instance.

**No additional setup needed!** Skip to step 3.

#### Option B: Set Up Your Own Supabase Instance (Recommended for Production)

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**
   - In your Supabase project dashboard, go to Settings > API
   - Copy your:
     - Project URL (e.g., `https://xxxxx.supabase.co`)
     - Anon/Public Key (starts with `eyJ...`)

3. **Create Environment File**
   
   Create a `.env` file in the project root:
   
   ```bash
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Update Supabase Configuration**
   
   Modify `src/lib/supabase.ts`:
   
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fifusnozzlusrsjwkepe.databasepad.com';
   const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_fallback_key';
   const supabase = createClient(supabaseUrl, supabaseKey);

   export { supabase };
   ```

5. **Run Database Migrations**
   
   You need to create the database schema. In your Supabase dashboard:
   
   - Go to SQL Editor
   - Create a new query
   - Copy and paste the contents of `src/lib/migrations/001_registration_system.sql`
   - Run the query
   
   **Note**: This migration assumes you already have the base tables (`users`, `training_sessions`, etc.). If you're starting fresh, you'll need to create those first.

### 3. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Database Schema

The application requires the following tables in your Supabase database:

### Core Tables (Required)
- `users` - System users (trainers, administrators)
- `training_sessions` - Training session information
- `training_plans` - Training plan details
- `facilities` - Training facilities/venues
- `participants` - Participant information

### Registration System Tables (Added by Migration)
- `registration_links` - Unique registration links for sessions
- `participant_registrations` - Self-registration data
- `uploaded_documents` - Documents uploaded during registration
- `link_analytics` - Analytics for registration links

### Running the Migration

To set up the registration system tables:

1. Open Supabase SQL Editor
2. Run the SQL file: `src/lib/migrations/001_registration_system.sql`
3. Verify tables were created successfully

## Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   └── sessions/     # Session-specific components
│   ├── pages/            # Page components (routes)
│   ├── lib/              # Utilities and services
│   │   ├── database.ts   # Database service layer
│   │   ├── supabase.ts   # Supabase client
│   │   └── migrations/   # SQL migration files
│   ├── types/            # TypeScript type definitions
│   ├── data/             # Mock data for development
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Implemented

### ✅ Registration System
- Secure registration link generation
- Public registration form with validation
- Duplicate registration prevention
- Real-time form validation
- Token-based access control

### 🚧 In Progress
- Document upload functionality
- Baby attendance handling
- Email notifications
- Registration confirmation

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the console output for the actual URL.

### Database Connection Issues

1. Check your Supabase credentials in `src/lib/supabase.ts`
2. Verify your Supabase project is active
3. Check the browser console for specific error messages
4. Ensure your IP is not blocked by Supabase (check project settings)

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit
```

### Build Errors

```bash
# Try building in development mode
npm run build:dev
```

## Environment Variables

If using your own Supabase instance, create a `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: File Upload Configuration
VITE_MAX_FILE_SIZE=5242880  # 5MB in bytes
VITE_ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png
```

## Testing the Registration Flow

1. **Start the dev server**: `npm run dev`
2. **Create a training session** (you'll need to be logged in as a trainer)
3. **Generate a registration link** from the session details
4. **Copy the link** and open it in a new browser tab/window
5. **Fill out the registration form** with test data
6. **Submit** and verify the data is saved in Supabase

## Mock Data

The project includes mock data in `src/data/mockData.ts` for development. This is useful when you don't have a fully populated database yet.

## Authentication

Currently, the project uses a simple authentication system. For production, you should:

1. Enable Supabase Auth
2. Configure authentication providers (email, OAuth, etc.)
3. Implement proper session management
4. Add role-based access control

## Next Steps

1. ✅ Install dependencies
2. ✅ Choose database option (existing or new Supabase)
3. ✅ Run migrations if using new database
4. ✅ Start development server
5. 🔄 Test the registration flow
6. 🔄 Continue with Task 6 (document uploads)

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the Supabase logs in your dashboard
3. Review the migration files to ensure all tables exist
4. Verify your environment variables are correct

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

---

**Happy Coding! 🚀**
