"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Heart,
  ArrowLeft,
  CreditCard,
  Shield,
  Users,
  GraduationCap,
  Droplets,
  Stethoscope,
  CheckCircle,
  Star,
} from "lucide-react"
import Link from "next/link"

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any
  }
}

interface DonationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  amount: string
  customAmount: string
  donationType: string
  purpose: string
  message: string
  isAnonymous: boolean
  agreeToTerms: boolean
  newsletter: boolean
}

export default function DonatePage() {
  const [formData, setFormData] = useState<DonationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    amount: "",
    customAmount: "",
    donationType: "one-time",
    purpose: "",
    message: "",
    isAnonymous: false,
    agreeToTerms: false,
    newsletter: true,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")
  const [donationId, setDonationId] = useState<string | null>(null)

  const presetAmounts = [
    { value: "25", label: "$25", description: "Provides clean water for 1 person for a month" },
    { value: "50", label: "$50", description: "Feeds a family of 4 for a week" },
    { value: "100", label: "$100", description: "Sponsors a child's education for a month" },
    { value: "250", label: "$250", description: "Provides medical care for 10 people" },
    { value: "500", label: "$500", description: "Builds a water well for a community" },
    { value: "1000", label: "$1000", description: "Funds a complete education program" },
  ]

  const donationPurposes = [
    { value: "education", label: "Education Programs", icon: GraduationCap },
    { value: "healthcare", label: "Healthcare Services", icon: Stethoscope },
    { value: "water", label: "Clean Water Projects", icon: Droplets },
    { value: "emergency", label: "Emergency Relief", icon: Heart },
    { value: "general", label: "Where Most Needed", icon: Users },
  ]

  const handleInputChange = (field: keyof DonationFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmountSelect = (amount: string) => {
    setFormData((prev) => ({ ...prev, amount, customAmount: "" }))
  }

  const initializeRazorpayPayment = async (donationId: string) => {
    try {
      const amount = getSelectedAmount()

      // Create Razorpay order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          donationId,
        }),
      })

      const orderResult = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || "Failed to create payment order")
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)

        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Razorpay payment
      const options = {
        key: orderResult.order.key,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: "Hope Foundation",
        description: `Donation for ${donationPurposes.find((p) => p.value === formData.purpose)?.label}`,
        order_id: orderResult.order.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#ff5722",
        },
        handler: async (response: any) => {
          // Payment successful, verify on server
          try {
            console.log("[v0] Starting payment verification")
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                donation_id: donationId,
              }),
            })

            let verifyResult
            const contentType = verifyResponse.headers.get("content-type")

            if (contentType && contentType.includes("application/json")) {
              verifyResult = await verifyResponse.json()
            } else {
              // If response is not JSON, get text for debugging
              const errorText = await verifyResponse.text()
              console.error("[v0] Non-JSON response:", errorText)
              throw new Error("Server returned invalid response format")
            }

            if (verifyResponse.ok && verifyResult.success) {
              console.log("[v0] Payment verification successful, redirecting to success page")
              const successUrl = new URL("/donate/success", window.location.origin)
              successUrl.searchParams.set("amount", getSelectedAmount())
              successUrl.searchParams.set("purpose", formData.purpose)
              successUrl.searchParams.set("type", formData.donationType)
              successUrl.searchParams.set("name", `${formData.firstName} ${formData.lastName}`)

              window.location.href = successUrl.toString()
            } else {
              throw new Error(verifyResult?.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("[v0] Payment verification error:", error)
            setSubmitStatus("error")
            setSubmitMessage(
              error instanceof Error ? error.message : "Payment verification failed. Please contact support.",
            )
          } finally {
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false)
            setSubmitStatus("error")
            setSubmitMessage("Payment cancelled. You can try again.")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("[v0] Payment initialization error:", error)
      setSubmitStatus("error")
      setSubmitMessage(error instanceof Error ? error.message : "Failed to initialize payment")
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setSubmitMessage("")

    try {
      const donationData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || null,
        amount: getSelectedAmount(),
        donationType: formData.donationType,
        purpose: formData.purpose,
        message: formData.message || null,
        paymentMethod: "razorpay",
      }

      console.log("[v0] Submitting donation data:", donationData)

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      })

      const result = await response.json()
      console.log("[v0] API response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit donation")
      }

      setDonationId(result.donation.id)
      console.log("[v0] Donation saved with ID:", result.donation.id)

      await initializeRazorpayPayment(result.donation.id)
    } catch (error) {
      console.error("[v0] Donation submission error:", error)
      setSubmitStatus("error")
      setSubmitMessage(error instanceof Error ? error.message : "An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const getSelectedAmount = () => {
    return formData.customAmount || formData.amount
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary animate-pulse-glow" />
              <span className="font-bold">Hope Foundation</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-primary text-primary-foreground animate-pulse-glow"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">
              Step {currentStep} of 3:{" "}
              {currentStep === 1 ? "Choose Amount" : currentStep === 2 ? "Personal Information" : "Review & Payment"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Amount Selection */}
          {currentStep === 1 && (
            <Card className="animate-fade-in-up">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl text-balance">Choose Your Donation Amount</CardTitle>
                <p className="text-muted-foreground text-pretty">
                  Every contribution makes a meaningful difference in someone's life
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preset Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presetAmounts.map((preset, index) => (
                    <Card
                      key={preset.value}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                        formData.amount === preset.value ? "ring-2 ring-primary bg-primary/10" : "hover:bg-accent/50"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleAmountSelect(preset.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-primary">{preset.label}</span>
                          {formData.amount === preset.value && <CheckCircle className="h-5 w-5 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground text-pretty">{preset.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="customAmount">Or enter a custom amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="customAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.customAmount}
                      onChange={(e) => {
                        handleInputChange("customAmount", e.target.value)
                        handleInputChange("amount", "")
                      }}
                      className="pl-8 text-lg"
                      min="1"
                    />
                  </div>
                </div>

                {/* Donation Type */}
                <div className="space-y-3">
                  <Label>Donation Type</Label>
                  <RadioGroup
                    value={formData.donationType}
                    onValueChange={(value) => handleInputChange("donationType", value)}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time">One-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                      <Badge variant="secondary" className="animate-pulse">
                        Popular
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly">Yearly</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Purpose Selection */}
                <div className="space-y-3">
                  <Label>Where should your donation help?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {donationPurposes.map((purpose, index) => (
                      <Card
                        key={purpose.value}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                          formData.purpose === purpose.value
                            ? "ring-2 ring-primary bg-primary/10"
                            : "hover:bg-accent/50"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => handleInputChange("purpose", purpose.value)}
                      >
                        <CardContent className="p-3 flex items-center space-x-3">
                          <purpose.icon className="h-5 w-5 text-primary" />
                          <span className="font-medium">{purpose.label}</span>
                          {formData.purpose === purpose.value && (
                            <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!getSelectedAmount() || !formData.purpose}
                  className="w-full animate-pulse-glow"
                  size="lg"
                >
                  Continue to Personal Information
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <Card className="animate-fade-in-up">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl text-balance">Your Information</CardTitle>
                <p className="text-muted-foreground text-pretty">Help us process your donation and send you updates</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      className="animate-fade-in-up"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      className="animate-fade-in-up animate-delay-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="animate-fade-in-up animate-delay-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="animate-fade-in-up animate-delay-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share why you're donating or leave a message of hope..."
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={4}
                    className="animate-fade-in-up animate-delay-800"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked) => handleInputChange("isAnonymous", checked as boolean)}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Make this donation anonymous
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange("newsletter", checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for impact updates
                    </Label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.firstName || !formData.lastName || !formData.email}
                    className="flex-1 animate-pulse-glow"
                  >
                    Review Donation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Donation Summary */}
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span>Donation Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Donation Amount:</span>
                    <span className="text-2xl font-bold text-primary">${getSelectedAmount()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Donation Type:</span>
                    <Badge variant="secondary" className="capitalize">
                      {formData.donationType}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Purpose:</span>
                    <span className="capitalize">
                      {donationPurposes.find((p) => p.value === formData.purpose)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Donor:</span>
                    <span>{formData.isAnonymous ? "Anonymous" : `${formData.firstName} ${formData.lastName}`}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="animate-fade-in-up animate-delay-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Secure payment processing powered by Razorpay</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card className="animate-fade-in-up animate-delay-400">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      required
                      className="mt-0.5 border-2 border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor="terms" className="text-sm text-pretty cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                      . I understand that my donation will be used to support Hope Foundation's programs and
                      initiatives.
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {submitStatus === "success" && (
                <Card className="animate-fade-in-up border-green-500 bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">{submitMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {submitStatus === "error" && (
                <Card className="animate-fade-in-up border-red-500 bg-red-50 dark:bg-red-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                      <span className="font-medium">Error: {submitMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.agreeToTerms || isSubmitting}
                  className="flex-1 animate-pulse-glow"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Donate ${getSelectedAmount()}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="animate-fade-in-up">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Secure & Encrypted</h3>
            <p className="text-sm text-muted-foreground">Your data is protected with bank-level security</p>
          </div>
          <div className="animate-fade-in-up animate-delay-200">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">100% Transparent</h3>
            <p className="text-sm text-muted-foreground">Track exactly how your donation is used</p>
          </div>
          <div className="animate-fade-in-up animate-delay-400">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Direct Impact</h3>
            <p className="text-sm text-muted-foreground">95% of funds go directly to programs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
