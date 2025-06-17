import { Client, Databases, Account, Storage } from "appwrite"

// Server-side Appwrite configuration for backend operations
console.log("🔧 Initializing server-side Appwrite...")

const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const apiKey = process.env.APPWRITE_API_KEY

if (!projectId) {
  console.error("❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined")
  throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined")
}

if (!endpoint) {
  console.error("❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined")
  throw new Error("NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined")
}

console.log("✅ Server Appwrite config:", { projectId, endpoint, hasApiKey: !!apiKey })

const client = new Client()
client.setEndpoint(endpoint).setProject(projectId)

if (apiKey) {
  try {
    client.setKey(apiKey)
    console.log("✅ Server API key configured successfully")
  } catch (error) {
    console.error("❌ Failed to set API key:", error)
    try {
      client.headers = {
        ...client.headers,
        "X-Appwrite-Key": apiKey,
      }
      console.log("✅ Server API key configured via headers")
    } catch (headerError) {
      console.error("❌ Failed to set API key via headers:", headerError)
      console.warn("⚠️ API key could not be configured - server operations may fail")
    }
  }
} else {
  console.warn("⚠️ No APPWRITE_API_KEY found - server operations may fail")
}

export const databases = new Databases(client)
export const account = new Account(client)
export const storage = new Storage(client)

export const appwriteConfig = {
  projectId,
  endpoint,
  databaseId: process.env.APPWRITE_DATABASE_ID || "main",
  incidentsCollectionId: process.env.APPWRITE_INCIDENTS_COLLECTION_ID || "incidents",
  logsBucketId: process.env.APPWRITE_LOGS_BUCKET_ID || "logs",
}

console.log("✅ Server Appwrite initialized successfully")
