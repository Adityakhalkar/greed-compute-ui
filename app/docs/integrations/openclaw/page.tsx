'use client'

import { IntegrationPage, Code, Step } from '@/components/integration-page'

const MCP_CONFIG = `{
  mcp: {
    servers: {
      "greed-compute": {
        command: "npx",
        args: ["greed-compute-mcp"],
        env: {
          GREED_API_KEY: "gc_your_key_here",
        },
      },
    },
  },
}`

const CLI_ADD = `openclaw mcp set greed-compute '{
  "command": "npx",
  "args": ["greed-compute-mcp"],
  "env": { "GREED_API_KEY": "gc_your_key_here" }
}'`

const CLI_VERIFY = `openclaw mcp list`

const NPX_INIT = `npx greed-compute init`

export default function OpenClawPage() {
  return (
    <IntegrationPage
      framework="openclaw"
      tagline="OpenClaw + greed-compute"
      description="OpenClaw supports MCP servers natively. greed-compute publishes one as an npm package, so the integration is one config entry. Your OpenClaw agents get stateful Python execution with checkpoints, forking, and zero re-imports between calls."
    >
      <Step n={1} title="Get an API key">
        <p>
          Sign in with GitHub at{' '}
          <a href="/login" className="text-accent hover:text-accent-dim transition-colors">
            /login
          </a>{' '}
          to get your <code className="text-accent font-mono text-xs">gc_...</code> key. Free tier includes 500 executions per day, no credit card required.
        </p>
        <p>
          Or run our setup CLI which handles login, key generation, and MCP config in one shot:
        </p>
        <Code lang="bash">{NPX_INIT}</Code>
      </Step>

      <Step n={2} title="Add to your OpenClaw config">
        <p>
          OpenClaw supports stdio MCP servers natively. Drop this into your OpenClaw config under <code className="text-accent font-mono text-xs">mcp.servers</code>:
        </p>
        <Code lang="json5">{MCP_CONFIG}</Code>
        <p className="text-xs text-text-tertiary mt-2">
          That&apos;s the entire integration. No SDK to install, no Python wrapper to write. The MCP server is published on npm as <code className="text-accent">greed-compute-mcp</code> and runs on demand via npx.
        </p>
      </Step>

      <Step n={3} title="Or use the CLI">
        <p>
          If you prefer not to edit JSON5 by hand, OpenClaw has an MCP management CLI:
        </p>
        <Code lang="bash">{CLI_ADD}</Code>
        <p className="mt-3">Verify it&apos;s registered:</p>
        <Code lang="bash">{CLI_VERIFY}</Code>
      </Step>

      <Step n={4} title="That's it">
        <p>
          Your OpenClaw agents now have access to 17 greed-compute tools:{' '}
          <code className="text-accent font-mono text-xs">create_session</code>,{' '}
          <code className="text-accent font-mono text-xs">execute_code</code>,{' '}
          <code className="text-accent font-mono text-xs">create_checkpoint</code>,{' '}
          <code className="text-accent font-mono text-xs">create_swarm</code>, and more. The agent will discover them from the MCP server automatically.
        </p>
        <p className="mt-3">
          Ask your agent to <span className="text-accent">&ldquo;create a Python session and analyze this dataset&rdquo;</span> and it&apos;ll work without any further configuration.
        </p>
      </Step>

      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">What you get</h2>
        <p className="text-sm text-text-secondary mb-4">
          The MCP server exposes the full greed-compute API as discoverable tools. The agent doesn&apos;t need any extra prompting or wrappers — it just sees them.
        </p>
        <div className="border border-border bg-surface p-4 text-xs font-mono text-text-secondary space-y-1">
          <div><span className="text-accent">·</span> create_session, execute_code, terminate_session</div>
          <div><span className="text-accent">·</span> create_checkpoint, restore_checkpoint, list_checkpoints</div>
          <div><span className="text-accent">·</span> create_swarm, get_swarm</div>
          <div><span className="text-accent">·</span> create_workspace, execute_in_workspace</div>
          <div><span className="text-accent">·</span> upload_file, download_file</div>
          <div><span className="text-accent">·</span> install_packages, get_usage</div>
          <div className="text-text-tertiary">17 tools total</div>
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Tips for OpenClaw + greed-compute</h2>
        <ul className="text-sm text-text-secondary space-y-3">
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Use the init CLI for first setup.</strong> <code className="text-accent font-mono text-xs">npx greed-compute init</code> handles GitHub login, generates the key, and writes the config for you.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Don&apos;t commit your API key.</strong> Use environment variable substitution or OpenClaw&apos;s secret management instead of inlining the key in config.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Pin the MCP server version.</strong> If you need reproducibility, use <code className="text-accent font-mono text-xs">npx greed-compute-mcp@0.2.1</code> instead of unpinned npx.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Multi-agent setups.</strong> Each agent that uses the MCP server gets its own greed-compute session. To share state, use workspaces (<code className="text-accent font-mono text-xs">create_workspace</code> + <code className="text-accent font-mono text-xs">execute_in_workspace</code>).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent">·</span>
            <span>
              <strong className="text-text-primary">Session lifetime.</strong> Sessions auto-expire after 15 minutes of inactivity. For long-running workflows, checkpoint periodically and restore when needed.
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
          <a href="https://github.com/Adityakhalkar/greed-compute-mcp" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dim transition-colors">
            mcp server source →
          </a>
          <a href="https://www.npmjs.com/package/greed-compute-mcp" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dim transition-colors">
            npm package →
          </a>
          <a href="/docs/integrations/anthropic" className="text-accent hover:text-accent-dim transition-colors">
            claude tool_use →
          </a>
        </div>
      </section>
    </IntegrationPage>
  )
}
