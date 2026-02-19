# Quick Start Guide 🚀

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works fine)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Database Setup

### Option A: Use Existing Database (Fastest)
The project is already configured with a working Supabase instance. Just skip to Step 3!

### Option B: Use Your Own Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to initialize (~2 minutes)

2. **Get Your Credentials**
   - Go to Settings > API
   - Copy your Project URL and anon key

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```

4. **Run Database Migrations**
   - Open your Supabase dashboard
   - Go to SQL Editor
   - Run these files in order:
     1. `src/lib/migrations/000_base_schema.sql` (creates all base tables)
     2. `src/lib/migrations/001_registration_system.sql` (adds registration features)

## Step 3: Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 4: Test the Registration Flow

1. Navigate to a training session (you'll need to create one first or use mock data)
2. Click "Generate Registration Link"
3. Copy the link and open it in a new tab
4. Fill out the registration form
5. Submit and verify it saves to the database

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
- Check your Supabase credentials in `src/lib/supabase.ts`
- Verify your Supabase project is active
- Check browser console for specific errors

### Port already in use
Vite will automatically use the next available port. Check the console output.

## Project Structure

```
src/
├── components/     # UI components
├── pages/         # Page components (routes)
├── lib/           # Services and utilities
│   ├── database.ts       # Database operations
│   ├── supabase.ts       # Supabase client
│   └── migrations/       # SQL migration files
├── types/         # TypeScript types
└── data/          # Mock data
```

## What's Implemented

✅ Registration link generation
✅ Public registration form
✅ Form validation
✅ Duplicate prevention
✅ Token-based access

## Next Steps

- Continue with Task 6: Document upload functionality
- Add email notifications
- Implement registration confirmation
- Add baby attendance handling

## Need Help?

Check the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---

**Happy coding! 🎉**
