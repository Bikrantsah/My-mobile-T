import { type NextRequest, NextResponse } from "next/server"

// FastAPI equivalent: @app.get("/verify_movie")
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get("title")

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title parameter is required",
        },
        { status: 400 },
      )
    }

    // Dummy AI logic for verification (equivalent to your FastAPI logic)
    const verificationResult = await verifyMovieTitle(title)

    return NextResponse.json({
      success: true,
      data: verificationResult,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Verification failed",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, religion_category } = body

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 },
      )
    }

    // Enhanced AI verification with multiple parameters
    const verificationResult = await verifyMovieContent({
      title,
      description,
      religion_category,
    })

    return NextResponse.json({
      success: true,
      data: verificationResult,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Verification failed",
      },
      { status: 500 },
    )
  }
}

// AI verification logic (equivalent to your FastAPI function)
async function verifyMovieTitle(title: string) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Dummy AI logic for verification
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes("test")) {
    return {
      status: "verified",
      confidence: 0.95,
      reason: "Title contains test keyword",
    }
  }

  // Check for inappropriate content
  const inappropriateWords = ["violence", "explicit", "inappropriate"]
  const hasInappropriate = inappropriateWords.some((word) => lowerTitle.includes(word))

  if (hasInappropriate) {
    return {
      status: "rejected",
      confidence: 0.9,
      reason: "Contains inappropriate content",
    }
  }

  // Check for religious content appropriateness
  const religiousKeywords = ["faith", "prayer", "spiritual", "divine", "holy"]
  const hasReligious = religiousKeywords.some((word) => lowerTitle.includes(word))

  if (hasReligious) {
    return {
      status: "verified",
      confidence: 0.85,
      reason: "Contains appropriate religious content",
    }
  }

  return {
    status: "unverified",
    confidence: 0.6,
    reason: "Requires manual review",
  }
}

// Enhanced verification for multiple content fields
async function verifyMovieContent(content: {
  title: string
  description?: string
  religion_category?: string
}) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const { title, description, religion_category } = content
  let score = 0
  const reasons = []

  // Title verification
  const titleResult = await verifyMovieTitle(title)
  if (titleResult.status === "verified") score += 30
  else if (titleResult.status === "rejected") score -= 50
  reasons.push(`Title: ${titleResult.reason}`)

  // Description verification
  if (description) {
    const descLower = description.toLowerCase()
    if (descLower.length > 50) {
      score += 20
      reasons.push("Description: Adequate length provided")
    }
    if (descLower.includes("family-friendly")) {
      score += 15
      reasons.push("Description: Family-friendly content detected")
    }
  }

  // Religion category verification
  if (religion_category && religion_category !== "Other") {
    score += 25
    reasons.push(`Category: Appropriate for ${religion_category}`)
  }

  // Determine final status
  let status = "unverified"
  let confidence = 0.5

  if (score >= 70) {
    status = "verified"
    confidence = Math.min(0.95, score / 100)
  } else if (score < 0) {
    status = "rejected"
    confidence = 0.9
  } else {
    confidence = Math.max(0.3, score / 100)
  }

  return {
    status,
    confidence: Math.round(confidence * 100) / 100,
    score,
    reasons,
  }
}
