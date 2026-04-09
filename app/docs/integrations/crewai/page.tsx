'use client'

import { IntegrationPage, Code, Step } from '@/components/integration-page'

const TOOL_CODE = `# greed_tool.py
import os
from typing import Type
import requests
from crewai.tools import BaseTool
from pydantic import BaseModel, Field, PrivateAttr


class GreedInput(BaseModel):
    code: str = Field(..., description="Python code to execute in the stateful session.")


class GreedCompute(BaseTool):
    name: str = "greed_compute"
    description: str = (
        "Execute Python code in a stateful session. Variables, imports, and "
        "loaded data persist across calls — do NOT re-import or re-load data "
        "on every call. Comes with pandas, numpy, sklearn, and matplotlib "
        "pre-loaded. Returns stdout, the last expression result, and any error."
    )
    args_schema: Type[BaseModel] = GreedInput

    _api_key: str = PrivateAttr()
    _base: str = PrivateAttr(default="https://compute.deep-ml.com/v1")
    _session_id: str = PrivateAttr(default="")
    _template: str = PrivateAttr(default="data-science")

    def __init__(self, template: str = "data-science", **data):
        super().__init__(**data)
        self._api_key = os.environ["GREED_API_KEY"]
        self._template = template
        self._session_id = self._create_session()

    def _headers(self):
        return {"X-API-Key": self._api_key, "Content-Type": "application/json"}

    def _create_session(self) -> str:
        r = requests.post(
            f"{self._base}/session/create",
            headers=self._headers(),
            json={"template": self._template, "ttl_seconds": 900},
        )
        r.raise_for_status()
        return r.json()["session_id"]

    def _run(self, code: str) -> str:
        r = requests.post(
            f"{self._base}/session/{self._session_id}/execute",
            headers=self._headers(),
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
from crewai import Agent, Task, Crew, LLM
from greed_tool import GreedCompute

llm = LLM(
    model="anthropic/claude-sonnet-4-5",
    api_key=os.environ["ANTHROPIC_API_KEY"],
)

# One tool instance = one persistent session.
# State lives for the entire run.
code_tool = GreedCompute(template="data-science")

analyst = Agent(
    role="Data Analyst",
    goal="Analyze sales data and compute month-over-month trends.",
    backstory=(
        "You are a Python data analyst. You use the greed_compute tool to "
        "execute code. Your session is stateful: once you import pandas or "
        "load a DataFrame, it stays available across tool calls. Never "
        "re-import or re-load data you have already set up."
    ),
    tools=[code_tool],
    llm=llm,
    verbose=True,
)

task = Task(
    description=(
        "Create a synthetic sales dataset with 30 days of data for 3 products. "
        "Then compute total revenue per product and identify the top performer. "
        "Finally, compute the 7-day rolling average for the top product."
    ),
    expected_output="Summary with revenue per product, top performer, and rolling average.",
    agent=analyst,
)

crew = Crew(agents=[analyst], tasks=[task], verbose=True)
print(crew.kickoff())
`

const RUN_CMD = `export GREED_API_KEY=gc_your_key_here
export ANTHROPIC_API_KEY=sk-ant-...
python agent.py`

const INSTALL_CMD = `pip install crewai requests`

export default function CrewAIPage() {
  return (
    <IntegrationPage
      framework="crewai"
      tagline="CrewAI + greed-compute"
      description="Give your CrewAI agents a persistent Python runtime. State survives across tool calls, so agents set up once and keep working. No more re-importing libraries on every turn, no more re-explaining what was already computed."
    >
      <Step n={1} title="Install">
        <p>You only need two packages: CrewAI itself and <code className="text-accent font-mono text-xs">requests</code> for the HTTP calls.</p>
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
          Drop this into <code className="text-accent font-mono text-xs">greed_tool.py</code>. It subclasses CrewAI's <code className="text-accent font-mono text-xs">BaseTool</code> and holds one stateful session for the lifetime of the tool instance.
        </p>
        <Code lang="python">{TOOL_CODE}</Code>
        <p className="text-xs text-text-tertiary mt-2">
          The key design choice: one tool instance = one session. State is preserved for the entire Crew run. Don&apos;t create a new tool instance per call.
        </p>
      </Step>

      <Step n={4} title="Wire it into an agent">
        <p>
          Pass the tool to an Agent like any other CrewAI tool. The important part is the <strong>backstory</strong> — it tells the LLM that state persists, so it stops re-importing libraries and re-loading data on every turn.
        </p>
        <Code lang="python">{AGENT_CODE}</Code>
      </Step>

      <Step n={5} title="Run it">
        <Code lang="bash">{RUN_CMD}</Code>
        <p className="mt-3">
          The agent will create a synthetic dataset, compute aggregations, and calculate a rolling average — all in the same Python interpreter. Check your token usage afterwards with <code className="text-accent font-mono text-xs">GET /v1/usage</code>.
        </p>
      </Step>

      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Tips for CrewAI + greed-compute</h2>
        <ul className="text-sm text-text-secondary space-y-3">
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">One tool per agent, not per task.</strong> If you recreate the tool, you lose the session and everything in it.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Be explicit in the backstory.</strong> Tell the agent that state persists. Otherwise LLMs default to re-importing pandas on every call out of habit.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Pick a template.</strong> <code className="text-accent font-mono text-xs">data-science</code> comes with pandas, numpy, sklearn, and matplotlib. <code className="text-accent font-mono text-xs">machine-learning</code> adds torch and transformers.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Session TTL.</strong> Default is 15 minutes. Bump <code className="text-accent font-mono text-xs">ttl_seconds</code> if your crew runs longer.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Multi-agent crews.</strong> Share the same tool instance between agents if you want them to share state. Give each agent its own instance if you want isolation.
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
          <a href="https://github.com/Adityakhalkar/greed-compute" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dim transition-colors">
            github →
          </a>
          <a href="/playground" className="text-accent hover:text-accent-dim transition-colors">
            try the playground →
          </a>
        </div>
      </section>
    </IntegrationPage>
  )
}
