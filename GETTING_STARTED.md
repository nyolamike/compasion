# Getting Started 🎯

Welcome! This guide will help you get the Training Management System running on your local machine.

## What You Need

Before starting, make sure you have:

- ✅ **Node.js 18+** - [Download here](https://nodejs.org/)
- ✅ **A code editor** - VS Code, WebStorm, etc.
- ✅ **A terminal** - Command Prompt, Terminal, or iTerm
- ✅ **Internet connection** - For downloading packages and accessing Supabase

## Choose Your Path

### 🚀 Path 1: Quick Start (5 minutes)

**Best for:** Just want to see it working quickly

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173)

**Done!** The app uses a pre-configured database.

📖 **Full guide:** [QUICK_START.md](QUICK_START.md)

---

### 🔧 Path 2: Full Setup (15 minutes)

**Best for:** Setting up for real development or production

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your own Supabase database:
   - Create account at [supabase.com](https://supabase.com)
   - Create a new project
   - Get your credentials

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Run database migrations:
   - Open Supabase SQL Editor
   - Run `000_base_schema.sql`
   - Run `001_registration_system.sql`

5. Start the server:
   ```bash
   npm run dev
   ```

📖 **Full guide:** [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## What's Next?

After getting the app running:

### 1. Explore the Features

- **Training Sessions** - View and manage training sessions
- **Registration Links** - Generate unique registration links
- **Public Registration** - Test the participant registration form
- **Analytics** - View registration statistics

### 2. Test the Registration Flow

1. Navigate to a training session
2. Click "Generate Registration Link"
3. Copy the link
4. Open it in a new browser tab
5. Fill out the registration form
6. Submit and verify it saves

### 3. Continue Development

The project is organized into tasks. Current status:

- ✅ Task 1: Database schema
- ✅ Task 2: Registration link service
- ✅ Task 3: Link management interface
- ✅ Task 4: Public registration foundation
- ✅ Task 5: Participant data collection form
- 🚧 Task 6: Document upload functionality (next)

## Project Structure

```
training-management-system/
├── src/
│   ├── components/          # UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── sessions/       # Session-specific components
│   ├── pages/              # Page components (routes)
│   │   └── PublicRegistration.tsx  # Registration form
│   ├── lib/                # Services and utilities
│   │   ├── database.ts     # Database operations
│   │   ├── supabase.ts     # Supabase client
│   │   ├── registrationLinkService.ts
│   │   └── migrations/     # SQL migration files
│   ├── types/              # TypeScript types
│   └── data/               # Mock data
├── public/                 # Static assets
├── .env.example           # Environment template
├── QUICK_START.md         # Quick start guide
├── SETUP_GUIDE.md         # Detailed setup
└── DATABASE_SETUP.md      # Database guide
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint

# Package Management
npm install             # Install dependencies
npm install <package>   # Add new package
```

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
Vite will automatically use the next available port. Check the console output.

### Database connection issues
- Verify Supabase credentials in `src/lib/supabase.ts`
- Check your Supabase project is active
- Look at browser console for specific errors

### Build errors
```bash
npm run build:dev  # Build in development mode
```

## Getting Help

- 📖 **[Quick Start Guide](QUICK_START.md)** - Fast setup
- 📖 **[Setup Guide](SETUP_GUIDE.md)** - Detailed instructions
- 📖 **[Database Setup](DATABASE_SETUP.md)** - Database configuration
- 🐛 **Issues** - Check browser console and terminal output
- 💬 **Questions** - Review the documentation files

## What's Included

### Frontend
- ⚛️ React 18 with TypeScript
- ⚡ Vite for fast development
- 🎨 TailwindCSS for styling
- 🧩 shadcn/ui component library
- 🔄 React Query for data fetching
- 🛣️ React Router for navigation

### Backend
- 🗄️ Supabase (PostgreSQL database)
- 🔐 Built-in authentication
- 📡 Real-time subscriptions
- 📦 File storage
- 🔒 Row Level Security

### Features
- ✅ Registration link generation
- ✅ Public registration form
- ✅ Real-time validation
- ✅ Duplicate prevention
- ✅ Responsive design
- ✅ TypeScript type safety

## Development Workflow

1. **Make changes** to files in `src/`
2. **See updates** instantly (hot reload)
3. **Check console** for errors
4. **Test features** in the browser
5. **Commit changes** when ready

## Best Practices

- ✅ Keep `.env` file in `.gitignore`
- ✅ Use TypeScript types for safety
- ✅ Test in multiple browsers
- ✅ Check console for warnings
- ✅ Follow the existing code style
- ✅ Write meaningful commit messages

## Next Steps

1. ✅ Get the app running
2. ✅ Explore the codebase
3. ✅ Test the registration flow
4. ✅ Review the task list in `.kiro/specs/participant-self-registration/tasks.md`
5. ✅ Continue with Task 6 (document uploads)

---

**Ready to start?** Choose your path above and let's go! 🚀

**Questions?** Check the detailed guides:
- [QUICK_START.md](QUICK_START.md)
- [SETUP_GUIDE.md](SETUP_GUIDE.md)
- [DATABASE_SETUP.md](DATABASE_SETUP.md)
