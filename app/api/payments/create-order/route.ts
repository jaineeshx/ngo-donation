import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "INR", donationId } = body

    // Validate required fields
    if (!amount || !donationId) {
      return NextResponse.json({ error: "Amount and donation ID are required" }, { status: 400 })
    }

    // Note: You'll need to add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 })
    }

    // Create Razorpay order
    const shortId = donationId.split("-")[0] // Use first part of UUID (8 chars)
    const timestamp = Date.now().toString().slice(-8) // Last 8 digits of timestamp
    const receipt = `don_${shortId}_${timestamp}` // Format: don_12345678_87654321 (24 chars total)

    const orderData = {
      amount: Math.round(Number.parseFloat(amount) * 100), // Convert to paise
      currency,
      receipt,
      notes: {
        donation_id: donationId, // Keep full donation ID in notes for reference
      },
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Razorpay API error:", errorData)
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
    }

    const order = await response.json()

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: razorpayKeyId,
      },
    })
  } catch (error) {
    console.error("Payment order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
