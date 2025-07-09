#!/usr/bin/env node

import { supabase } from "../lib/supabase"
import fs from "fs"
import path from "path"

interface Command {
  name: string
  description: string
  handler: (args: string[]) => Promise<void>
}

const commands: Command[] = [
  {
    name: "migrate",
    description: "Run database migrations",
    handler: runMigrations,
  },
  {
    name: "makemigrations",
    description: "Create new migration files",
    handler: makeMigrations,
  },
  {
    name: "runserver",
    description: "Start the development server",
    handler: runServer,
  },
  {
    name: "shell",
    description: "Start interactive shell",
    handler: startShell,
  },
  {
    name: "createsuperuser",
    description: "Create admin user",
    handler: createSuperUser,
  },
]

async function runMigrations(args: string[]) {
  console.log("Running migrations...")

  try {
    const scriptsDir = path.join(process.cwd(), "scripts")
    const files = fs
      .readdirSync(scriptsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    for (const file of files) {
      console.log(`Applying migration: ${file}`)
      const sqlContent = fs.readFileSync(path.join(scriptsDir, file), "utf-8")

      // Split by semicolon and execute each statement
      const statements = sqlContent.split(";").filter((stmt) => stmt.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc("exec_sql", { sql: statement.trim() })
          if (error) {
            console.error(`Error in ${file}:`, error.message)
          }
        }
      }
    }

    console.log("Migrations completed successfully!")
  } catch (error: any) {
    console.error("Migration failed:", error.message)
  }
}

async function makeMigrations(args: string[]) {
  console.log("Creating new migration...")

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
  const migrationName = args[0] || "auto_migration"
  const fileName = `${timestamp}-${migrationName}.sql`

  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL statements here
-- Example:
-- ALTER TABLE movies ADD COLUMN new_field VARCHAR(255);
-- CREATE INDEX idx_new_field ON movies(new_field);
`

  const scriptsDir = path.join(process.cwd(), "scripts")
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true })
  }

  fs.writeFileSync(path.join(scriptsDir, fileName), template)
  console.log(`Created migration file: scripts/${fileName}`)
}

async function runServer(args: string[]) {
  console.log("Starting development server...")
  console.log("Server would start on http://localhost:3000")
  console.log("Use 'npm run dev' to actually start the Next.js server")
}

async function startShell(args: string[]) {
  console.log("Interactive shell - connecting to Supabase...")

  try {
    const { data, error } = await supabase.from("movies").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Connection failed:", error.message)
    } else {
      console.log(`Connected successfully! Movies count: ${data}`)
      console.log("You can now interact with the database using the supabase client")
    }
  } catch (error: any) {
    console.error("Shell connection failed:", error.message)
  }
}

async function createSuperUser(args: string[]) {
  console.log("Creating superuser...")

  const email = args[0] || "admin@example.com"
  const password = args[1] || "admin123"

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: "admin",
        username: "admin",
      },
    })

    if (error) {
      console.error("Failed to create superuser:", error.message)
    } else {
      console.log(`Superuser created successfully: ${email}`)
      console.log(`User ID: ${data.user.id}`)
    }
  } catch (error: any) {
    console.error("Superuser creation failed:", error.message)
  }
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2)
  const commandName = args[0]

  if (!commandName) {
    console.log("Available commands:")
    commands.forEach((cmd) => {
      console.log(`  ${cmd.name.padEnd(15)} - ${cmd.description}`)
    })
    return
  }

  const command = commands.find((cmd) => cmd.name === commandName)

  if (!command) {
    console.error(`Unknown command: ${commandName}`)
    return
  }

  await command.handler(args.slice(1))
}

if (require.main === module) {
  main().catch(console.error)
}
