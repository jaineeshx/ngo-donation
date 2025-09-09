"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Heart, Share2, Download, Home, Users, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface DonationData {
  amount: string
  purpose: string | null
  donationType: string | null
  donorName: string | null
  date: string
  receiptId: string
}

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const donationData = useMemo((): DonationData | null => {
    const amount = searchParams.get("amount")
    if (!amount) return null

    return {
      amount,
      purpose: searchParams.get("purpose"),
      donationType: searchParams.get("type"),
      donorName: searchParams.get("name"),
      date: new Date().toLocaleDateString(),
      receiptId: `NGO-${Date.now()}`,
    }
  }, [searchParams])

  const generatePDFReceipt = useCallback(async () => {
    if (!donationData) return

    setIsDownloading(true)

    try {
      const receiptContent = document.createElement("div")
      receiptContent.style.cssText = `
        width: 800px;
        padding: 40px;
        background: #1a1a1a;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        position: absolute;
        top: -9999px;
        left: -9999px;
      `

      receiptContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background: #ff5722; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <span style="color: white; font-size: 20px;">♥</span>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Hope Foundation</h1>
          </div>
          <h2 style="margin: 0; color: #ff5722; font-size: 24px;">Donation Receipt</h2>
        </div>
        
        <div style="background: #2a2a2a; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 20px 0; color: #ff5722; font-size: 20px;">Thank You, ${donationData.donorName || "Generous Donor"}!</h3>
          <p style="margin: 0 0 20px 0; color: #cccccc; line-height: 1.6;">
            Your generous donation of <strong style="color: #ff5722;">$${donationData.amount}</strong> will make a real difference in the lives of those we serve.
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <div>
              <div style="border-bottom: 1px solid #444; padding: 12px 0; display: flex; justify-content: space-between;">
                <span style="color: #999;">Amount:</span>
                <span style="font-weight: bold; color: #ff5722;">$${donationData.amount}</span>
              </div>
              <div style="border-bottom: 1px solid #444; padding: 12px 0; display: flex; justify-content: space-between;">
                <span style="color: #999;">Type:</span>
                <span>${donationData.donationType || "One-time"}</span>
              </div>
            </div>
            <div>
              <div style="border-bottom: 1px solid #444; padding: 12px 0; display: flex; justify-content: space-between;">
                <span style="color: #999;">Date:</span>
                <span>${donationData.date}</span>
              </div>
              <div style="border-bottom: 1px solid #444; padding: 12px 0; display: flex; justify-content: space-between;">
                <span style="color: #999;">Receipt ID:</span>
                <span style="font-family: monospace; font-size: 12px;">${donationData.receiptId}</span>
              </div>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(receiptContent)

      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const canvas = await html2canvas(receiptContent, {
        backgroundColor: "#1a1a1a",
        scale: 2,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Hope-Foundation-Receipt-${donationData.receiptId}.pdf`)
      document.body.removeChild(receiptContent)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Sorry, there was an error generating your receipt.")
    } finally {
      setIsDownloading(false)
    }
  }, [donationData])

  const handleShare = useCallback(async () => {
    if (!donationData) return

    const shareText = `I just donated $${donationData.amount} to Hope Foundation! Join me in making a difference. 🌟`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "I made a donation to Hope Foundation!",
          text: shareText,
          url: window.location.origin,
        })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 3000)
      }
    } catch (error) {
      // Fallback to manual copy
      const textArea = document.createElement("textarea")
      textArea.value = `${shareText} ${window.location.origin}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    }
  }, [donationData])

  if (!donationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No donation data found</h1>
          <Link href="/donate">
            <Button>Make a Donation</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary animate-pulse" />
              <span className="font-bold">Hope Foundation</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">Thank You! 🎉</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Your generous donation has been successfully processed
          </p>
        </div>

        {/* Donation Details */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Donation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-2xl font-bold text-primary">${donationData.amount}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="secondary" className="capitalize">
                    {donationData.donationType || "One-time"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{donationData.date}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Receipt ID:</span>
                  <span className="font-mono text-sm">{donationData.receiptId}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Message */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Your Impact</h3>
              <p className="text-lg text-muted-foreground text-pretty mb-4">
                Your ${donationData.amount} donation will help us provide essential services to those in need.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center space-x-2 bg-transparent"
              disabled={shareSuccess || copySuccess}
            >
              {shareSuccess || copySuccess ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{shareSuccess ? "Shared!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Share Your Impact</span>
                </>
              )}
            </Button>
            <Button
              onClick={generatePDFReceipt}
              variant="outline"
              className="flex items-center space-x-2 bg-transparent"
              disabled={isDownloading}
            >
              <Download className={`h-4 w-4 ${isDownloading ? "animate-spin" : ""}`} />
              <span>{isDownloading ? "Generating..." : "Download Receipt"}</span>
            </Button>
          </div>

          <Link href="/">
            <Button className="w-full flex items-center justify-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
