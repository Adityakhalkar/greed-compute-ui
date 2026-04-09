'use client'

import { IntegrationPage, Code, Step } from '@/components/integration-page'

const TOOL_CODE = `# greed_tool.py
import os
import requests
from langchain_core.tools import tool

_BASE = "https://compute.deep-ml.com/v1"
_API_KEY = os.environ["GREED_API_KEY"]
_HEADERS = {"X-API-Key": _API_KEY, "Content-Type": "application/json"}


def _create_session(template: str = "data-science") -> str:
    r = requests.post(
        f"{_BASE}/session/create",
        headers=_HEADERS,
        json={"template": template, "ttl_seconds": 900},
    )
    r.raise_for_status()
    return r.json()["session_id"]


# One session for the entire process lifetime
_SESSION_ID = _create_session()


@tool
def greed_compute(code: str) -> str:
    """Execute Python code in a stateful session.

    Variables, imports, and loaded data persist across calls — do NOT
    re-import or re-load data on every call. Comes with pandas, numpy,
    sklearn, and matplotlib pre-loaded. Returns stdout, the last
    expression result, and any error.

    Args:
        code: Python code to execute.
    """
    r = requests.post(
        f"{_BASE}/session/{_SESSION_ID}/execute",
        headers=_HEADERS,
        json={"code": code},
    )
    r.raise_for_status()
    result = r.json()

    parts = []
    if result.get("stdout"):
        parts.append(f"stdout:\\n{result['stdout']}")
    if result.get("result") is not None:
        parts.append(f"result: {result['result']}")
    if result.get("error"):
        parts.append(f"error: {result['error']}")
    return "\\n".join(parts) if parts else "(no output)"
`

const AGENT_CODE = `# agent.py
import os
from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import create_react_agent
from greed_tool import greed_compute

SYSTEM_PROMPT = """You are a data analyst. You have access to a greed_compute tool
that executes Python code in a stateful session. State persists across tool
calls: variables you define, libraries you import, and DataFrames you load
STAY in memory. Do NOT re-import libraries or re-load data on every call.
pandas, numpy, sklearn, and matplotlib are already imported for you."""

model = ChatAnthropic(
    model="claude-sonnet-4-5",
    api_key=os.environ["ANTHROPIC_API_KEY"],
)

agent = create_react_agent(
    model=model,
    tools=[greed_compute],
    prompt=SYSTEM_PROMPT,
)

task = (
    "Create a synthetic sales dataset with 30 days of data for 3 products. "
    "Then compute total revenue per product and identify the top performer. "
    "Finally, compute the 7-day rolling average for the top product."
)

result = agent.invoke({"messages": [{"role": "user", "content": task}]})

# Print the final assistant message
for msg in result["messages"]:
    if getattr(msg, "type", "") == "ai" and msg.content:
        print(msg.content)
`

const INSTALL_CMD = `pip install langgraph langchain-anthropic requests`

const RUN_CMD = `export GREED_API_KEY=gc_your_key_here
export ANTHROPIC_API_KEY=sk-ant-...
python agent.py`

export default function LangGraphPage() {
  return (
    <IntegrationPage
      framework="langgraph"
      tagline="LangGraph + greed-compute"
      description="Give your LangGraph agents a persistent Python runtime. The ReAct agent keeps the same Python session across every tool call, so imports, DataFrames, and loaded models all stay in memory between turns. Your agent sets up once and keeps working."
    >
      <Step n={1} title="Install">
        <p>
          LangGraph, the Anthropic model wrapper, and requests. That&apos;s it.
        </p>
        <Code lang="bash">{INSTALL_CMD}</Code>
      </Step>

      <Step n={2} title="Get an API key">
        <p>
          Sign in with GitHub at{' '}
          <a href="/login" className="text-accent hover:text-accent-dim transition-colors">
            /login
          </a>{' '}
          to get your <code className="text-accent font-mono text-xs">gc_...</code> key. Free tier includes 500 executions per day, no credit card required.
        </p>
      </Step>

      <Step n={3} title="Create the tool">
        <p>
          Drop this into <code className="text-accent font-mono text-xs">greed_tool.py</code>. It uses LangChain&apos;s <code className="text-accent font-mono text-xs">@tool</code> decorator. The session gets created once at module import and every call to <code className="text-accent font-mono text-xs">greed_compute</code> reuses it.
        </p>
        <Code lang="python">{TOOL_CODE}</Code>
        <p className="text-xs text-text-tertiary mt-2">
          The key design choice: one session per Python process. All tool invocations share that session, so state builds up naturally.
        </p>
      </Step>

      <Step n={4} title="Wire it into a ReAct agent">
        <p>
          Pass the tool to <code className="text-accent font-mono text-xs">create_react_agent</code> and invoke. The system prompt is critical — it tells the model that state persists, so it stops re-importing libraries on every turn.
        </p>
        <Code lang="python">{AGENT_CODE}</Code>
      </Step>

      <Step n={5} title="Run it">
        <Code lang="bash">{RUN_CMD}</Code>
        <p className="mt-3">
          The agent will build a dataset, compute aggregations, and calculate a rolling average — all without re-importing pandas between tool calls. Check usage with <code className="text-accent font-mono text-xs">GET /v1/usage</code>.
        </p>
      </Step>

      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Tips for LangGraph + greed-compute</h2>
        <ul className="text-sm text-text-secondary space-y-3">
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">One tool module per process.</strong> The session is created when <code className="text-accent font-mono text-xs">greed_tool.py</code> is imported. Import it once, use it everywhere.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Put the state contract in the prompt.</strong> Tell the model explicitly that variables persist. Otherwise LLMs default to defensive re-imports and you lose half the savings.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Migration note.</strong> LangGraph 1.0 moved <code className="text-accent font-mono text-xs">create_react_agent</code> to <code className="text-accent font-mono text-xs">langchain.agents.create_agent</code>. The old import still works but will be removed in v2.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Pick a template.</strong> <code className="text-accent font-mono text-xs">data-science</code> comes with pandas, numpy, sklearn, matplotlib. <code className="text-accent font-mono text-xs">machine-learning</code> adds torch and transformers.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Multi-agent graphs.</strong> If two nodes in your graph need to share state, have them call the same tool module. Different tool modules = different sessions = isolated state.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Checkpoints for long runs.</strong> For workflows that span multiple agent invocations, call <code className="text-accent font-mono text-xs">POST /v1/session/&#123;id&#125;/checkpoint</code> periodically so you can restore state if something crashes.
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-12 pt-8 border-t border-border">
        <p className="text-xs text-text-tertiary font-mono mb-3">want more?</p>
        <div className="flex gap-6 text-sm">
          <a href="/docs" className="text-accent hover:text-accent-dim transition-colors">
            full API reference →
          </a>
          <a href="/docs/integrations/crewai" className="text-accent hover:text-accent-dim transition-colors">
            crewai integration →
          </a>
          <a href="/playground" className="text-accent hover:text-accent-dim transition-colors">
            try the playground →
          </a>
        </div>
      </section>
    </IntegrationPage>
  )
}
