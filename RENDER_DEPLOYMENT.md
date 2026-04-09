# FINOVA Render Deployment

This repository is now configured for Render with a Blueprint file:
- Web service name: finova
- Worker service name: finova-voice-agent

See blueprint:
- render.yaml

## 1) One-click Blueprint deploy

1. Push this repository to GitHub.
2. In Render dashboard, click New + -> Blueprint.
3. Select the repo and branch.
4. Render will detect render.yaml and create both services.

## 2) Service topology

- Web (Node): Next.js app
- Worker (Python): ARIA LiveKit voice agent

## 3) Required environment variables

Set these for the Web service (finova):
- NODE_ENV=production
- NODE_VERSION=20
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN (recommended: 7d)
- NEXT_PUBLIC_APP_URL (use your Render URL or custom domain)
- OPENROUTER_API_KEY
- OPENROUTER_MODEL
- VORA_AGENT_URL
- VORA_MODEL
- VORA_CONFIG_SECRET
- OLLAMA_API_KEY (optional if not using Ollama)
- COINGECKO_API_KEY
- NEXT_PUBLIC_COINGECKO_API_KEY
- LIVEKIT_URL
- NEXT_PUBLIC_LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- DEEPGRAM_API_KEY
- CEREBRAS_API_KEY
- CARTESIA_API_KEY
- NEXT_PUBLIC_CHAIN_ID
- NEXT_PUBLIC_NETWORK_NAME
- NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

Set these for the Worker service (finova-voice-agent):
- PYTHON_VERSION=3.11
- NEXT_PUBLIC_APP_URL
- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- DEEPGRAM_API_KEY
- CEREBRAS_API_KEY
- CARTESIA_API_KEY

A sanitized template is included here:
- .env.render.example

## 4) Custom name: finova

- Render service name is already set to finova in render.yaml.
- Default URL will be similar to: https://finova.onrender.com (if available).
- For a custom domain, open service Settings -> Custom Domains.

## 5) Health check

- Health endpoint: /api/health
- Configured in render.yaml as healthCheckPath.

## 6) Build and start commands

Web service:
- Build: npm ci && npm run build
- Start: npm run start

Worker service:
- Build: pip install -r requirements.txt
- Start: python agent.py start

## 7) Security note

Do not commit real secrets to git.
Store all real keys only in Render environment variables.
