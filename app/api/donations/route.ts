import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { fullName, email, phone, amount, donationType, purpose, message, paymentMethod = "razorpay" } = body

    // Validate required fields
    if (!fullName || !email || !amount || !donationType || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert donation record
    const { data, error } = await supabase
      .from("donations")
      .insert({
        full_name: fullName,
        email,
        phone,
        amount: Number.parseFloat(amount),
        donation_type: donationType,
        purpose,
        message,
        payment_method: paymentMethod,
        payment_status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save donation" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      donation: data,
      message: "Donation record created successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    // Get donations for the email
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    return NextResponse.json({ donations: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
