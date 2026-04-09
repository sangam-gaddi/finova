"""
ARIA - FINOVA Financial OS Voice Assistant

Role-aware voice assistant for FINOVA OS.
Guides users through their financial budgets, trackings, charts, and investments.

Uses: LiveKit (rooms), Deepgram STT, Cerebras LLM, Cartesia TTS

Run with:
    python agent.py dev
"""

import asyncio
import json
import os
import logging
import pathlib
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    cartesia,
    deepgram,
    silero,
    openai,
)

# ──────────────────────────────────────────────────────────────
# Load env — try local .env first (robust on Windows multiprocessing
# spawns), then fall back to parent .env.local
# ──────────────────────────────────────────────────────────────
script_dir = pathlib.Path(__file__).parent.absolute()
local_env  = script_dir / ".env"
parent_env = script_dir.parent / ".env.local"

# override=True ensures spawned child processes get the values too
if local_env.exists():
    load_dotenv(str(local_env), override=True)
if parent_env.exists():
    load_dotenv(str(parent_env), override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aria-finova")

logger.info(f"LIVEKIT_URL      : {os.getenv('LIVEKIT_URL', 'NOT SET')}")
logger.info(f"DEEPGRAM_API_KEY : {'SET' if os.getenv('DEEPGRAM_API_KEY') else 'NOT SET'}")
logger.info(f"CEREBRAS_API_KEY : {'SET' if os.getenv('CEREBRAS_API_KEY') else 'NOT SET'}")
logger.info(f"CARTESIA_API_KEY : {'SET' if os.getenv('CARTESIA_API_KEY') else 'NOT SET'}")

_APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

ABOUT_FINOVA = f"""
ABOUT FINOVA FINANCIAL OS:
FINOVA is a highly interactive, window-based operating system for personal finance.
It runs entirely in a browser.

Key features of the OS:
- Desktop with draggable app icons!
- Track App: To manage Income and Expenses manually.
- Budget App: To set limits on standard categories like Food, Transport, and dynamically track adherence.
- Save App: An analytical dashboard with graphs showing expense patterns and safe-to-spend amounts.
- Invest App: Check live stock markets, view global equities, and calculate compounded SIP returns.
- Receipt Scanner: Upload a grocery receipt and vision AI automatically parses items and categorizes them into Track.

What is VORA?
Vora is the text chatbot agent of FINOVA. You (ARIA) are the voice agent. Do not confuse the two. Vora types; you talk.
"""

def _fmt_inr(n):
    return f"₹{int(n):,}"

def _build_finance_context(data: dict) -> str:
    name         = data.get("name", "User")
    transactions = data.get("transactions", [])
    budget       = data.get("budget", {})
    
    total_expenses = sum(t.get("amount", 0) for t in transactions if t.get("type", "") == "expense")
    total_income   = sum(t.get("amount", 0) for t in transactions if t.get("type", "") == "income")
    
    # Quick string building for metrics
    budget_limit = budget.get("limit", 0)
    budget_spend = budget.get("spent", 0)
    
    return f"""You are ARIA, the hyper-intelligent financial voice assistant embedded in FINOVA OS.

PERSONALITY:
- Crisp, mathematically sharp, yet warm and supportive.
- Speak naturally as in a real voice conversation — short sentences, no bullet points in speech!
- If the user has spent a lot, gently remind them of their budget. If they have good habits, commend them.
- Financial context: Indian Rupees, compound interest, active budgeting.

CURRENT USER FINANCIAL SNAPSHOT:
- Name: {name}
- Total Income logged: {_fmt_inr(total_income)}
- Total Expenses logged: {_fmt_inr(total_expenses)}
- Primary Budget Limit: {_fmt_inr(budget_limit)} (Amount spent towards this: {_fmt_inr(budget_spend)})

{ABOUT_FINOVA}

GUIDELINES:
- Keep voice responses SHORT: 1-3 sentences.
- Speak amounts in Indian Rupees. Never read out exact decimals unless critical. 
- Try to recommend which FINOVA app they should open based on their questions (e.g. "To check your global portfolio, open the Invest app", or "Drag your grocery bill into the Scanner app").
- Never say "bullet point" or "section" — speak naturally in flowing dialogue.
"""

def get_system_instructions(ctx: dict) -> str:
    return _build_finance_context(ctx)

# ──────────────────────────────────────────────────────────────
# Agent class
# ──────────────────────────────────────────────────────────────

class AriaAgent(Agent):
    def __init__(self, ctx: dict):
        instructions = get_system_instructions(ctx)
        super().__init__(instructions=instructions)
        self.ctx = ctx

def build_greeting(ctx: dict) -> str:
    name = ctx.get("name", "User")
    total_exp = sum(t.get("amount", 0) for t in ctx.get("transactions", []) if t.get("type", "") == "expense")

    if total_exp > 0:
        return (
            f"Greet warmly. Introduce yourself as ARIA, the FINOVA voice assistant. "
            f"Acknowledge that they have logged {_fmt_inr(total_exp)} in expenses so far. "
            f"Ask if they want to analyze their budget or check their investments today."
        )
    else:
        return (
            f"Greet warmly. Introduce yourself as ARIA, the FINOVA voice assistant. "
            f"Ask how you can help them track or grow their wealth today."
        )

# ──────────────────────────────────────────────────────────────
# Entrypoint
# ──────────────────────────────────────────────────────────────

async def entrypoint(ctx: agents.JobContext):
    logger.info("🎙️ ARIA starting up for FINOVA OS...")
    await ctx.connect()
    
    user_ctx = {}
    if ctx.room.metadata:
        try:
            user_ctx = json.loads(ctx.room.metadata)
        except Exception:
            pass

    agent = AriaAgent(user_ctx)
    llm_instance = openai.LLM(
        base_url="https://api.cerebras.ai/v1",
        api_key=os.getenv("CEREBRAS_API_KEY"),
        model="llama3.1-8b",
    )

    session = AgentSession(
        stt=deepgram.STT(model="nova-2", language="en"),
        llm=llm_instance,
        tts=cartesia.TTS(
            model="sonic-2",
            voice="f786b574-daa5-4673-aa0c-cbe3e8534c02", 
        ),
        vad=silero.VAD.load(),
    )

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(noise_cancellation=True),
    )

    greeting_prompt = build_greeting(user_ctx)
    await session.generate_reply(instructions=greeting_prompt)
    await asyncio.Future()

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
