"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { ID } from "appwrite"
import { getAppwriteClient } from "@/lib/appwrite-client"

interface User {
  $id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkAuth()
  }, [])

  const clearError = () => setError(null)

  // Check current authentication status
  const checkAuth = async () => {
    try {
      setError(null)
      console.log("Checking authentication status...")

      const { account } = getAppwriteClient()
      const session = await account.get()

      console.log("User session found:", session)
      setUser(session as User)
    } catch (error: any) {
      console.log("No active session:", error?.message || error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Handle user login
  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      console.log("Attempting login for:", email)

      const { account } = getAppwriteClient()
      const session = await account.createEmailPasswordSession(email, password)

      console.log("Login successful:", session)
      await checkAuth() // Refresh user data
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "Login failed"

      // Helpful error messages for users
      if (error?.message) {
        if (error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password"
        } else if (error.message.includes("user_not_found")) {
          errorMessage = "No account found with this email"
        } else if (error.message.includes("too_many_requests")) {
          errorMessage = "Too many attempts. Please try again later"
        } else if (error.message.includes("not authorized")) {
          errorMessage = "Authentication service is not properly configured. Please contact support."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle user registration
  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      setLoading(true)

      console.log("Starting registration for:", { email, name })

      // Validate user input
      if (!email || !password || !name) {
        throw new Error("All fields are required")
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      const { account } = getAppwriteClient()

      // Create the user account
      const userId = ID.unique()
      console.log("Creating account with ID:", userId)

      try {
        const newAccount = await account.create(userId, email, password, name)
        console.log("Account created successfully:", newAccount)
      } catch (createError: any) {
        console.error("Account creation failed:", createError)

        // Handle specific registration errors
        if (createError?.message?.includes("not authorized")) {
          throw new Error("User registration is not enabled. Please check system configuration.")
        } else if (createError?.message?.includes("user_already_exists")) {
          throw new Error("An account with this email already exists")
        } else if (createError?.code === 401) {
          throw new Error("Registration is not allowed. Please check system configuration.")
        } else {
          throw createError
        }
      }

      // Log the user in after successful registration
      console.log("Creating session...")
      try {
        const session = await account.createEmailPasswordSession(email, password)
        console.log("Session created successfully:", session)
      } catch (sessionError: any) {
        console.error("Session creation failed:", sessionError)

        if (sessionError?.message?.includes("not authorized")) {
          throw new Error("Login after registration failed. Please try logging in manually.")
        } else {
          throw sessionError
        }
      }

      // Update user state
      await checkAuth()

      console.log("Registration completed successfully")
    } catch (error: any) {
      console.error("Registration error:", error)

      let errorMessage = "Registration failed"

      // Provide helpful error messages
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.code) {
        switch (error.code) {
          case 401:
            errorMessage = "Registration is not authorized. Please check system settings."
            break
          case 409:
            errorMessage = "An account with this email already exists"
            break
          case 400:
            errorMessage = "Invalid registration data"
            break
          case 429:
            errorMessage = "Too many attempts. Please try again later"
            break
          default:
            errorMessage = `Registration failed (Error ${error.code})`
        }
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle user logout
  const logout = async () => {
    try {
      setError(null)
      console.log("Logging out...")

      const { account } = getAppwriteClient()
      await account.deleteSession("current")

      setUser(null)
      console.log("Logout successful")
    } catch (error: any) {
      console.error("Logout error:", error)
      // Clear user state even if logout fails
      setUser(null)

      const errorMessage = error?.message || "Logout failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
