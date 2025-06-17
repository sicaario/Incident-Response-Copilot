"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Shield, AlertCircle, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await login(email.trim(), password)
      toast({
        title: "ACCESS GRANTED",
        description: "Successfully logged into the system",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "Invalid credentials"

      if (error.message) {
        if (error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password"
        } else if (error.message.includes("user_not_found")) {
          errorMessage = "No account found with this email"
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "ACCESS DENIED",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
              SYSTEM ACCESS
            </CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              Enter credentials to access Incident Response Copilot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-mono">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`bg-gray-900/50 border-gray-600 text-white font-mono ${
                    errors.email ? "border-red-500" : "focus:border-cyan-400"
                  }`}
                  placeholder="user@domain.com"
                />
                {errors.email && (
                  <div className="flex items-center text-sm text-red-400 font-mono">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
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
                  required
                  className={`bg-gray-900/50 border-gray-600 text-white font-mono ${
                    errors.password ? "border-red-500" : "focus:border-cyan-400"
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <div className="flex items-center text-sm text-red-400 font-mono">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-mono text-lg py-3 border border-cyan-400/30"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    ACCESS SYSTEM
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm font-mono">
              <span className="text-gray-400">No account? </span>
              <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
