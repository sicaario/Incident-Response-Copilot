import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const GROQ_API_KEY = process.env.GROQ_API_KEY
const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const MEM0_API_KEY = process.env.MEM0_API_KEY

interface AnalysisRequest {
  incidentId: string
  logContent: string
  fileId?: string
}

export async function GET() {
  console.log("Analysis API health check")

  return NextResponse.json({
    message: "Analysis API is running on Edge Runtime",
    environment: {
      hasGroqKey: !!GROQ_API_KEY,
      hasTavilyKey: !!TAVILY_API_KEY,
      hasMem0Key: !!MEM0_API_KEY,
      runtime: "edge",
    },
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  console.log("Starting incident analysis")

  try {
    // Make sure we have all our API keys
    const missingKeys = []
    if (!GROQ_API_KEY) missingKeys.push("GROQ_API_KEY")
    if (!TAVILY_API_KEY) missingKeys.push("TAVILY_API_KEY")
    if (!MEM0_API_KEY) missingKeys.push("MEM0_API_KEY")

    if (missingKeys.length > 0) {
      console.error("Missing API keys:", missingKeys)
      return NextResponse.json(
        {
          error: "Server configuration error: Missing API keys",
          missingKeys,
        },
        { status: 500 },
      )
    }

    console.log("All machine learning API keys present")

    // Parse the request data
    const body = await request.json()
    const { incidentId, logContent }: AnalysisRequest = body

    console.log("Request data:", {
      incidentId: incidentId?.slice(0, 8),
      logContentLength: logContent?.length,
      hasIncidentId: !!incidentId,
      hasLogContent: !!logContent,
    })

    // Validate we have the required data
    if (!incidentId || !logContent) {
      console.error("Missing required fields:", { hasIncidentId: !!incidentId, hasLogContent: !!logContent })
      return NextResponse.json({ error: "Missing required fields: incidentId and logContent" }, { status: 400 })
    }

    console.log(`Starting analysis for incident: ${incidentId}`)

    console.log("Running machine learning pipeline...")
    const analysisResults = await runMachineLearningPipeline(logContent)

    return NextResponse.json({
      success: true,
      message: "Analysis completed successfully",
      results: analysisResults,
      incidentId,
    })
  } catch (error: any) {
    console.error("Analysis API error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

// Our main machine learning pipeline - this coordinates all the agents
async function runMachineLearningPipeline(logContent: string) {
  try {
    console.log(`🚀 Starting machine learning pipeline`)

    // 1- Parse the logs to extract errors and important info
    console.log("🔍 Step 1: Running log parsing agent...")
    const parsedData = await logParsingAgent(logContent)
    console.log("Log parsing completed:", {
      errorCount: parsedData.errors.length,
    })

    // 2- Analyze the root cause of the issues
    console.log("🧠 Step 2: Running root cause analysis agent...")
    const rootCause = await rootCauseAgent(logContent, parsedData.errors)
    console.log("Root cause analysis completed")

    // 3- Search the web for similar issues and solutions
    console.log("Step 3: Running research agent...")
    const externalContext = await researchAgent(parsedData.errors, rootCause)
    console.log("Research completed")

    // 4- Generate actionable solutions
    console.log("Step 4: Running solution synthesis agent...")
    const solutions = await solutionAgent(logContent, rootCause, externalContext)
    console.log("Solution generation completed")

    console.log("Machine learning pipeline completed successfully")

    return {
      parsed_errors: parsedData.errors || [],
      root_cause: rootCause || "Unable to determine root cause",
      external_context: externalContext || "No external research available",
      recommended_solutions: solutions || "No solutions generated",
      resolution_status: "resolved", 
    }
  } catch (error: any) {
    console.error("Machine learning pipeline error:", error)
    throw error
  }
}

// Agent 1- Parse logs and extract errors
async function logParsingAgent(logContent: string) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `Extract errors and critical issues from log content. Return JSON with 'errors' array.`,
          },
          {
            role: "user",
            content: `Parse this log content:\n\n${logContent.slice(0, 4000)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      const parsed = JSON.parse(content)
      return {
        errors: Array.isArray(parsed.errors) ? parsed.errors.slice(0, 10) : [],
      }
    } catch {
      const lines = content
        .split("\n")
        .filter((line) => line.toLowerCase().includes("error"))
        .slice(0, 5)
      return {
        errors: lines.length > 0 ? lines : ["Log parsing completed - no specific errors identified"],
      }
    }
  } catch (error: any) {
    return {
      errors: [`Log parsing failed: ${error.message}`],
    }
  }
}

// Agent 2- Analyze root cause of the issues
async function rootCauseAgent(logContent: string, errors: string[]) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `Analyze log content and identify the root cause. Be specific and technical.`,
          },
          {
            role: "user",
            content: `Log: ${logContent.slice(0, 2000)}\nErrors: ${errors.slice(0, 5).join("\n")}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    return content.trim()   
  } catch (error: any) {
    return `Root cause analysis failed: ${error.message}`
  }
}

// Agent 3- Research similar issues online
async function researchAgent(errors: string[], rootCause: string) {
  try {
    const keywordWeights = new Map<string, number>();
    
    errors.concat(rootCause).forEach(text => {
      const tokens = text.match(/([A-Z]{2,}(?=[A-Z]|\b)|[\w#]+|\d{3,})/g) || [];
      
      tokens.forEach(token => {
        const normalized = token.toLowerCase();
        const isErrorCode = /^[a-z]+\d+$|^\d{3,}$/i.test(token);
        const isTechTerm = /(error|exception|fail|timeout|undefined|null)/i.test(token);
        const isRareWord = token.length > 8;
        
        let weight = 1;
        if (isErrorCode) weight = 3;
        else if (isTechTerm) weight = 2;
        else if (isRareWord) weight = 1.5;
        
        keywordWeights.set(normalized, 
          (keywordWeights.get(normalized) || 0) + weight
        );
      });
    });

    // Remove stopwords and sort by relevance
    const stopWords = new Set(['the', 'and', 'at', 'in', 'of', 'to', 'a']);
    const sortedKeywords = Array.from(keywordWeights.entries())
      .filter(([word]) => !stopWords.has(word) && word.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // Build StackOverflow-optimized query
    const queryParts = [
      ...sortedKeywords,
      ...rootCause.split(/\W+/).filter(w => w.length > 3),
      "stackoverflow"
    ];
    
    const searchQuery = Array.from(new Set(queryParts))
      .join(" ")
      .substring(0, 100);

    if (!searchQuery) return "No valid search terms extracted";

    // Search with StackOverflow/Github focus
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",  
        include_domains: ["stackoverflow.com", "github.com"],
        max_results: 5,            
        include_answer: true        
      })
    });

    if (!response.ok) throw new Error(`Tavily API error: ${response.status}`);

    const data = await response.json();
    if (!data.results?.length) return "No relevant solutions found";


    return data.results
      .sort((a, b) => 
        b.url.includes("stackoverflow") - a.url.includes("stackoverflow")
      )
      .slice(0, 5) 
      .map(result => {
        const source = result.url.includes("stackoverflow")
          ? "🔥 StackOverflow" 
          : "🐙 GitHub";
          
        return `${source} | ${result.title}\n${result.content.split("\n")[0]}\n${result.url}`;
      })
      .join("\n\n");
      
  } catch (error) {
    return `Research failed: ${error.message}`;
  }
}

// Agent 4- Generate actionable solutions
async function solutionAgent(logContent: string, rootCause: string, externalContext: string) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `Generate specific, actionable solutions for incident resolution. Provide step-by-step instructions.`,
          },
          {
            role: "user",
            content: `Root Cause: ${rootCause}\n\nContext: ${externalContext.slice(0, 800)}\n\nProvide solutions:`,
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    return content.trim()
  } catch (error: any) {
    return `Solution generation failed: ${error.message}`
  }
}
