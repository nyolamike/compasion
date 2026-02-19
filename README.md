# Training Management System

A comprehensive training management system built with React, TypeScript, and Supabase.

## Features

- 📋 Training session management
- 🔗 Self-registration links for participants
- ✅ Real-time form validation
- 🚫 Duplicate registration prevention
- 📊 Analytics and reporting
- 📱 Responsive design

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions
- **[Database Setup](DATABASE_SETUP.md)** - Database configuration guide

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** TailwindCSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL)
- **State Management:** React Query
- **Routing:** React Router v6

## Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── lib/              # Services and utilities
│   │   ├── database.ts   # Database operations
│   │   ├── supabase.ts   # Supabase client
│   │   └── migrations/   # SQL migration files
│   ├── types/            # TypeScript types
│   └── data/             # Mock data
├── QUICK_START.md        # Quick start guide
├── SETUP_GUIDE.md        # Detailed setup guide
└── DATABASE_SETUP.md     # Database setup guide
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Implemented

✅ Registration link generation  
✅ Public registration form  
✅ Form validation  
✅ Duplicate prevention  
✅ Token-based access control  

## Coming Soon

🚧 Document upload functionality  
🚧 Email notifications  
🚧 Registration confirmation  
🚧 Baby attendance handling  

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For setup help, see the [Setup Guide](SETUP_GUIDE.md) or [Quick Start](QUICK_START.md).

