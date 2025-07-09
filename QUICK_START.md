# Quick Start Guide

## 1. Set Up Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://abcxyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`

## 2. Verify Your Setup

Run the setup verification script:

\`\`\`bash
npm run verify-setup
\`\`\`

This will check:
- ✅ Environment variables are set
- ✅ Supabase connection works
- ✅ Database is accessible

## 3. Set Up Database

Run the database migrations:

\`\`\`bash
npm run migrate
\`\`\`

## 4. Create Admin User

Create an admin user for testing:

\`\`\`bash
npm run createsuperuser admin@example.com admin123
\`\`\`

## 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000 to see your application!

## Troubleshooting

If you see configuration errors:

1. **Check your .env.local file exists** in the project root
2. **Verify your Supabase credentials** are correct
3. **Restart your development server** after making changes
4. **Run verification script** to diagnose issues

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one)
4. Go to Settings → API
5. Copy:
   - **Project URL** → NEXT_PUBLIC_SUPABASE_URL
   - **anon/public key** → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **service_role key** → SUPABASE_SERVICE_ROLE_KEY

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run verify-setup` - Verify Supabase configuration
- `npm run migrate` - Run database migrations
- `npm run createsuperuser` - Create admin user
- `npm run check-env` - Check environment variables
\`\`\`

Now create a simple setup component that shows your current configuration status:
