import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Test API endpoint called")
  return NextResponse.json({ message: "API routing is working", timestamp: new Date().toISOString() })
}
