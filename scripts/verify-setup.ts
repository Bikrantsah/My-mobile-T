#!/usr/bin/env node

import { supabase, isSupabaseConfigured, supabaseConfig } from "../lib/supabase"

async function verifySetup() {
  console.log("🔍 Verifying Supabase Setup...")
  console.log("=".repeat(50))

  // Check environment variables
  console.log("📋 Environment Variables:")
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseConfig.hasUrl ? "✅ Set" : "❌ Missing"}`)
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseConfig.hasKey ? "✅ Set" : "❌ Missing"}`)
  console.log(`  Configuration Status: ${isSupabaseConfigured() ? "✅ Valid" : "❌ Invalid"}`)
  console.log()

  if (!isSupabaseConfigured()) {
    console.log("❌ Setup incomplete. Please add your Supabase credentials to .env.local")
    console.log()
    console.log("Required format:")
    console.log("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co")
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here")
    console.log("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here")
    return
  }

  // Test connection
  console.log("🔗 Testing Connection...")
  try {
    const { data, error } = await supabase.from("movies").select("count", { count: "exact", head: true })

    if (error) {
      console.log("❌ Connection failed:", error.message)
      console.log()
      console.log("💡 This might be normal if you haven't run the database migrations yet.")
      console.log("   Run: npm run migrate")
    } else {
      console.log("✅ Connection successful!")
      console.log(`   Movies table accessible (count: ${data})`)
    }
  } catch (err: any) {
    console.log("❌ Connection error:", err.message)
  }

  console.log()
  console.log("🚀 Next Steps:")
  console.log("1. Run database migrations: npm run migrate")
  console.log("2. Create admin user: npm run createsuperuser")
  console.log("3. Start development server: npm run dev")
}

if (require.main === module) {
  verifySetup().catch(console.error)
}
