import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    const formattedUsers = users.users.map((user) => ({
      id: user.id,
      username: user.user_metadata?.username || user.email?.split("@")[0] || "",
      email: user.email || "",
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
