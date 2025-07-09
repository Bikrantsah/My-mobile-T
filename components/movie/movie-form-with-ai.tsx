"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface MovieFormProps {
  distributorId: number
}

const RELIGION_CATEGORIES = ["Christianity", "Islam", "Judaism", "Hinduism", "Buddhism", "Sikhism", "Other", "Secular"]

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Mandarin",
  "Other",
]

interface VerificationResult {
  status: "verified" | "unverified" | "rejected"
  confidence: number
  score?: number
  reasons?: string[]
  reason?: string
}

export function MovieFormWithAI({ distributorId }: MovieFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    religion_category: "",
    language: "",
    video_url: "",
  })
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState("")
  const [verification, setVerification] = useState<VerificationResult | null>(null)

  const handleVerifyContent = async () => {
    if (!formData.title) {
      setMessage("Please enter a title before verification")
      return
    }

    setVerifying(true)
    setVerification(null)

    try {
      const response = await fetch("/api/ai/verify-movie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          religion_category: formData.religion_category,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setVerification(result.data)
      } else {
        setMessage(result.message || "Verification failed")
      }
    } catch (error: any) {
      setMessage("Verification service unavailable")
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Include verification status in submission
    const movieData = {
      ...formData,
      distributor_id: distributorId,
      verification_status: verification?.status || "pending",
      verification_details: verification ? JSON.stringify(verification) : null,
    }

    const { error } = await supabase.from("movies").insert(movieData)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Movie submitted successfully! Awaiting approval.")
      setFormData({
        title: "",
        description: "",
        religion_category: "",
        language: "",
        video_url: "",
      })
      setVerification(null)
    }
    setLoading(false)
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Movie with AI Verification</CardTitle>
        <CardDescription>Submit a new movie for distribution with AI content verification</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Movie Title</Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVerifyContent}
                disabled={verifying || !formData.title}
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
          </div>

          {verification && (
            <Alert>
              <div className="flex items-center gap-2">
                {getVerificationIcon(verification.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getVerificationColor(verification.status)}>
                      {verification.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">Confidence: {verification.confidence * 100}%</span>
                    {verification.score && <span className="text-sm text-gray-600">Score: {verification.score}</span>}
                  </div>
                  <AlertDescription>
                    {verification.reason && <p>{verification.reason}</p>}
                    {verification.reasons && (
                      <ul className="list-disc list-inside mt-1">
                        {verification.reasons.map((reason, index) => (
                          <li key={index} className="text-sm">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Provide a detailed description of your movie..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Religion Category</Label>
              <Select
                value={formData.religion_category}
                onValueChange={(value) => setFormData({ ...formData, religion_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <Button type="submit" disabled={loading || verification?.status === "rejected"} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Submitting..." : "Submit Movie"}
          </Button>

          {verification?.status === "rejected" && (
            <Alert>
              <XCircle className="w-4 h-4" />
              <AlertDescription>
                This movie cannot be submitted due to verification issues. Please modify the content and verify again.
              </AlertDescription>
            </Alert>
          )}
        </form>

        {message && (
          <Alert className="mt-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
