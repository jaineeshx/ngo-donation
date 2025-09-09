import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Payment verification API called - SIMPLIFIED VERSION")

  try {
    console.log("[v0] Reading request body")
    const body = await request.json()
    console.log("[v0] Request body received:", Object.keys(body))

    // Just return success for now to test routing
    console.log("[v0] Returning success response")
    return NextResponse.json({
      success: true,
      message: "Payment verification API is working",
      test: true,
    })
  } catch (error) {
    console.error("[v0] Error in verification API:", error)
    return NextResponse.json(
      {
        error: "API Error",
        message: error instanceof Error ? error.message : "Unknown error",
        test: true,
      },
      { status: 500 },
    )
  }
}
