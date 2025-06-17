# AI Incident Response Copilot

A cloud-native, agentic incident response automation platform that helps DevOps teams quickly diagnose and resolve incidents using AI-powered analysis.

![AI Incident Copilot Architecture](https://i.postimg.cc/R04Tk4yj/Untitled-2025-06-16-1946.png)

## Features

- **Multi-Agent Pipeline**: Automated log parsing, root cause analysis, and solution generation
- **Web Research**: Automatic search through StackOverflow, GitHub, and vendor documentation
- **Memory Storage**: Long-term incident pattern recognition using Mem0
- ⚡ **Fast Analysis**: Powered by Groq LLaMA 3 70B for lightning-fast processing
- **Cloud-Native**: Fully hosted with Appwrite backend and storage

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Appwrite (Database, Storage, Auth)
- **AI Services**: Groq (LLaMA 3 70B), Tavily (Web Search), Mem0 (Memory)

## Set Up

1. Clone the repository:
```
git clone https://github.com/sicaario/Incident-Response-Copilot.git
```
2. Install dependencies:

```
npm install --legacy-peer-deps    
```

4. Set up environment variables:
```
cp .env.example .env.local
```

7. Set up Appwrite:
```
  - Create a new project in Appwrite console
  - Create database "main" 
  - Create collection "incidents" with appropriate permissions
  - Create storage bucket "logs"
  - Enable Email/Password authentication 
```

8. Run the development server:
```
npm run dev
```
## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Upload Logs**: Upload log files or paste log content
3. **AI Analysis**: Watch as AI agents analyze your incident
4. **Review Results**: Get root cause analysis and actionable solutions
5. **Track Progress**: Monitor incident resolution status

## Agent Pipeline

1. **Log Parsing Agent**: Extracts errors, timestamps, and service information
2. **Root Cause Agent**: Identifies potential failure points and causes
3. **Research Agent**: Searches for similar incidents and solutions online
4. **Solution Synthesis Agent**: Generates actionable fix recommendations
5. **Memory Storage**: Stores incidents for future pattern recognition

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project ID | Yes |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite endpoint URL | Yes |
| `GROQ_API_KEY` | Groq API key for LLM | Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | Yes |
| `MEM0_API_KEY` | Mem0 API key for memory storage | Yes |
| `APPWRITE_DATABASE_ID` | Database ID (default: main) | No |
| `APPWRITE_INCIDENTS_COLLECTION_ID` | Incidents collection ID | No |
| `APPWRITE_LOGS_BUCKET_ID` | Logs storage bucket ID | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
