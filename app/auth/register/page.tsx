"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Shield, AlertCircle, CheckCircle, XCircle, Settings, ExternalLink, RefreshCw, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppwriteSetupGuide } from "@/components/appwrite-setup-guide"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [configStatus, setConfigStatus] = useState<"checking" | "valid" | "invalid">("checking")
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const { register, loading, error, clearError } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Check configuration on mount
  useEffect(() => {
    checkConfiguration()
  }, [])

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  // Setup guide if authorization error occurs
  useEffect(() => {
    if (error && (error.includes("not authorized") || error.includes("Auth settings"))) {
      setShowSetupGuide(true)
    }
  }, [error])

  const checkConfiguration = () => {
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT

    console.log("Checking configuration:", {
      hasProjectId: !!projectId,
      hasEndpoint: !!endpoint,
      projectId,
      endpoint,
    })

    if (!projectId || !endpoint) {
      setConfigStatus("invalid")
      return
    }

    setConfigStatus("valid")
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!name.trim()) {
      errors.name = "Name is required"
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (configStatus !== "valid") {
      toast({
        title: "CONFIGURATION ERROR",
        description: "Application is not properly configured. Please check environment variables.",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    clearError()
    setShowSetupGuide(false)

    try {
      await register(email.trim(), password, name.trim())

      toast({
        title: "REGISTRATION SUCCESSFUL",
        description: "Account created successfully. Welcome to Incident Response Copilot!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration failed:", error)

      let description = error.message || "Failed to create account. Please try again."

      if (error.message?.includes("not authorized")) {
        setShowSetupGuide(true)
        description = "User registration is not enabled. Please follow the setup guide below."
      }

      toast({
        title: "REGISTRATION FAILED",
        description,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getConfigStatusIcon = () => {
    switch (configStatus) {
      case "checking":
        return <div className="animate-spin rounded-full h-3 w-3 border-b border-cyan-400"></div>
      case "valid":
        return <CheckCircle className="h-3 w-3 text-green-400" />
      case "invalid":
        return <XCircle className="h-3 w-3 text-red-400" />
    }
  }

  const getConfigStatusText = () => {
    switch (configStatus) {
      case "checking":
        return "CHECKING SYSTEM..."
      case "valid":
        return "SYSTEM READY"
      case "invalid":
        return "CONFIGURATION ERROR"
    }
  }

  const isFormDisabled = configStatus !== "valid" || loading || submitting

  if (showSetupGuide) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowSetupGuide(false)}
              className="mb-4 border-gray-700 text-gray-300"
            >
              ← Back to Registration
            </Button>
          </div>
          <AppwriteSetupGuide />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)] animate-pulse"></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Shield className="h-12 w-12 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 border border-cyan-400 rounded-full animate-spin opacity-30"></div>
              </div>
            </div>
            <CardTitle className="text-2xl font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SYSTEM REGISTRATION
            </CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              Create your Incident Response Copilot account
            </CardDescription>

            {/* Configuration Status */}
            <div className="flex items-center justify-center mt-3 text-sm font-mono">
              {getConfigStatusIcon()}
              <span className={`ml-2 ${configStatus === "invalid" ? "text-red-400" : "text-gray-400"}`}>
                {getConfigStatusText()}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {configStatus === "invalid" && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-400 mr-2" />
                  <p className="text-sm text-red-400 font-mono">SYSTEM CONFIGURATION MISSING</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                    {error.includes("not authorized") && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-red-300 font-mono">USER REGISTRATION NOT ENABLED IN SYSTEM</p>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 border-gray-600 text-gray-300 font-mono"
                            onClick={() => setShowSetupGuide(true)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            SETUP GUIDE
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 border-gray-600 text-gray-300 font-mono"
                            onClick={() => window.open("https://cloud.appwrite.io", "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            CONSOLE
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 font-mono">
                  FULL NAME
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`bg-gray-900/50 border-gray-600 text-white font-mono ${
                    validationErrors.name ? "border-red-500" : "focus:border-cyan-400"
                  }`}
                  disabled={isFormDisabled}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <div className="flex items-center text-sm text-red-400 font-mono">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-mono">
                  EMAIL ADDRESS
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-gray-900/50 border-gray-600 text-white font-mono ${
                    validationErrors.email ? "border-red-500" : "focus:border-cyan-400"
                  }`}
                  disabled={isFormDisabled}
                  placeholder="user@domain.com"
                />
                {validationErrors.email && (
                  <div className="flex items-center text-sm text-red-400 font-mono">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-mono">
                  PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-gray-900/50 border-gray-600 text-white font-mono ${
                    validationErrors.password ? "border-red-500" : "focus:border-cyan-400"
                  }`}
                  disabled={isFormDisabled}
                  placeholder="Create a password"
                />
                {validationErrors.password && (
                  <div className="flex items-center text-sm text-red-400 font-mono">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.password}
                  </div>
                )}
                <p className="text-xs text-gray-400 font-mono">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-mono">
                  CONFIRM PASSWORD
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-gray-900/50 border-gray-600 text-white font-mono ${
                    validationErrors.confirmPassword ? "border-red-500" : "focus:border-cyan-400"
                  }`}
                  disabled={isFormDisabled}
                  placeholder="Confirm your password"
                />
                {validationErrors.confirmPassword && (
                  <div className="flex items-center text-sm text-red-400 font-mono">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-mono text-lg py-3 border border-cyan-400/30"
                disabled={isFormDisabled}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    CREATING ACCOUNT...
                  </>
                ) : configStatus === "invalid" ? (
                  "CONFIGURATION ERROR"
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    CREATE ACCOUNT
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm font-mono">
              <span className="text-gray-400">Already have an account? </span>
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 underline">
                Sign in
              </Link>
            </div>

            {error && error.includes("not authorized") && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-xs font-mono text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  REFRESH AFTER SETUP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
