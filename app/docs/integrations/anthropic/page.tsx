'use client'

import { IntegrationPage, Code, Step } from '@/components/integration-page'

const FULL_CODE = `# example.py
import os
import requests
from anthropic import Anthropic

GREED_BASE = "https://compute.deep-ml.com/v1"
GREED_KEY = os.environ["GREED_API_KEY"]
GREED_HEADERS = {"X-API-Key": GREED_KEY, "Content-Type": "application/json"}


# ── Session helpers ─────────────────────────────────────────────────────────

def create_session(template: str = "data-science") -> str:
    r = requests.post(
        f"{GREED_BASE}/session/create",
        headers=GREED_HEADERS,
        json={"template": template, "ttl_seconds": 900},
    )
    r.raise_for_status()
    return r.json()["session_id"]


def execute_code(session_id: str, code: str) -> dict:
    r = requests.post(
        f"{GREED_BASE}/session/{session_id}/execute",
        headers=GREED_HEADERS,
        json={"code": code},
    )
    r.raise_for_status()
    return r.json()


# ── Tool definition for Claude ──────────────────────────────────────────────

GREED_TOOL = {
    "name": "execute_python",
    "description": (
        "Execute Python code in a stateful session. Variables, imports, "
        "and loaded data persist across calls. pandas, numpy, sklearn, "
        "and matplotlib are pre-loaded. Returns stdout, the last expression "
        "result, and any error. Do NOT re-import or re-load data on every call."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Python code to execute in the persistent session.",
            }
        },
        "required": ["code"],
    },
}


# ── Agent loop ──────────────────────────────────────────────────────────────

def run_agent(task: str):
    session_id = create_session(template="data-science")
    client = Anthropic()
    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=2048,
            tools=[GREED_TOOL],
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        # If there are no tool calls, the loop is done
        tool_uses = [b for b in response.content if b.type == "tool_use"]
        if not tool_uses:
            break

        # Execute every tool call and feed the results back to Claude
        tool_results = []
        for tu in tool_uses:
            result = execute_code(session_id, tu.input["code"])
            output = result.get("stdout", "") or ""
            if result.get("result") is not None:
                output += f"\\nresult: {result['result']}"
            if result.get("error"):
                output += f"\\nerror: {result['error']}"
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tu.id,
                "content": output or "(no output)",
            })

        messages.append({"role": "user", "content": tool_results})

    return messages


if __name__ == "__main__":
    run_agent("Build a synthetic sales dataset, find the top product, and compute its 7-day rolling average.")
`

const INSTALL_CMD = `pip install anthropic requests`

const RUN_CMD = `export GREED_API_KEY=gc_your_key_here
export ANTHROPIC_API_KEY=sk-ant-...
python example.py`

export default function AnthropicPage() {
  return (
    <IntegrationPage
      framework="anthropic"
      tagline="Claude tool_use + greed-compute"
      description="The lowest-level integration. No framework, just the Anthropic Python SDK calling greed-compute via REST. Great if you're building your own agent loop and want full control over the tool_use cycle."
    >
      <Step n={1} title="Install">
        <p>
          The Anthropic SDK and <code className="text-accent font-mono text-xs">requests</code>. Nothing else.
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

      <Step n={3} title="The full agent loop">
        <p>
          One file, no framework. Creates a session, defines the tool spec for Claude, and runs an agent loop until Claude stops calling tools. The session is created once and shared across all tool calls in the loop, so state persists.
        </p>
        <Code lang="python">{FULL_CODE}</Code>
        <p className="text-xs text-text-tertiary mt-2">
          The tool description is what makes the difference. Tell the model that state persists. Otherwise it&apos;ll re-import pandas on every call out of habit.
        </p>
      </Step>

      <Step n={4} title="Run it">
        <Code lang="bash">{RUN_CMD}</Code>
      </Step>

      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Tips for direct Claude tool_use</h2>
        <ul className="text-sm text-text-secondary space-y-3">
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Write the tool description like a contract.</strong> The more you tell Claude about what state survives, the less it&apos;ll waste tokens re-establishing context.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">One session per agent invocation.</strong> Create the session at the start of <code className="text-accent font-mono text-xs">run_agent</code>, share it across the entire loop. Killing it when the loop ends is optional but tidy.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Multiple parallel tool_uses.</strong> Claude can call the tool multiple times in one turn. Iterate them all and append every result before the next API call.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Long-running code?</strong> Use <code className="text-accent font-mono text-xs">/v1/session/&#123;id&#125;/execute/async</code> instead of <code className="text-accent font-mono text-xs">/execute</code>. You get a job ID immediately and can poll for results.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Error handling.</strong> The execute endpoint returns 423 if the session is already running code. Wait and retry, or use async.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Conversation reset?</strong> If you start a new conversation but want the same Python state, store the session_id and pass it back in. As long as you ping the session before TTL, it stays alive.
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-12 pt-8 border-t border-border">
        <p className="text-xs text-text-tertiary font-mono mb-3">want more?</p>
        <div className="flex gap-6 text-sm flex-wrap">
          <a href="/docs" className="text-accent hover:text-accent-dim transition-colors">
            full API reference →
          </a>
          <a href="/docs/integrations/crewai" className="text-accent hover:text-accent-dim transition-colors">
            crewai integration →
          </a>
          <a href="/docs/integrations/langgraph" className="text-accent hover:text-accent-dim transition-colors">
            langgraph integration →
          </a>
          <a href="/playground" className="text-accent hover:text-accent-dim transition-colors">
            try the playground →
          </a>
        </div>
      </section>
    </IntegrationPage>
  )
}
