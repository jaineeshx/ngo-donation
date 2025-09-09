import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, donation_id } = body

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !donation_id) {
      return NextResponse.json({ error: "Missing required payment verification data" }, { status: 400 })
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpayKeySecret) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 })
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update donation record with payment details
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("donations")
      .update({
        payment_status: "completed",
        razorpay_payment_id,
        razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", donation_id)
      .select()
      .single()

    if (error) {
      console.error("Database update error:", error)
      return NextResponse.json({ error: "Failed to update donation record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      donation: data,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
