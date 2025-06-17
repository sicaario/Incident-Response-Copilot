"use client"

import { Account, Client, Databases, Storage } from "appwrite"

// Client-side Appwrite configuration for user 
const createAppwriteClient = () => {
  try {
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT

    if (!projectId) {
      throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined")
    }

    if (!endpoint) {
      throw new Error("NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined")
    }

    console.log("Initializing Appwrite client with:", { projectId, endpoint })

    // Create and configure the client
    const client = new Client()
    client.setEndpoint(endpoint).setProject(projectId)

    return {
      client,
      account: new Account(client),
      databases: new Databases(client),
      storage: new Storage(client),
    }
  } catch (error) {
    console.error("Failed to create Appwrite client:", error)
    throw error
  }
}

// Create a singleton instance to avoid multiple connections
let appwriteInstance: ReturnType<typeof createAppwriteClient> | null = null

export const getAppwriteClient = () => {
  if (!appwriteInstance) {
    appwriteInstance = createAppwriteClient()
  }
  return appwriteInstance
}

export const appwriteConfig = {
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "",
  databaseId: "main",
  incidentsCollectionId: "incidents",
  logsBucketId: "logs",
}
