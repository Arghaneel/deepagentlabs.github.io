/* Use cases menu content: the ONLY place to edit it.
   Read by assets/js/usecases.js (builds the dropdown on every page) and by 404.html
   (shows the right name on "coming soon" pages).

   - packages: the six fixed categories, in the same order as the Products and Docs menus.
     Keep the ids; they match the product URLs. "summary" is the short grey line under the name.
   - useCases: placeholder examples for now. Replace the titles and slugs once the real
     use cases exist. They power the "Most asked" chips and the "coming soon" page names.

   Links (built automatically, or set your own):
     package item    -> /<id>/usecases/              (override with  href: "...")
     each use case   -> /<id>/usecases/<slug>/       (override with  href: "...", e.g. a GitHub link)

   "Most asked" chips in the dark card: add  mostAsked: "Short label"  to any use case.
   Chips appear in the order the use cases are listed here. Aim for about five. */
window.DAL_USECASES = {
  packages: [
    {
      id: "agenticlens",
      name: "AgenticLens",
      summary: "Trace runs, track cost, gate releases.",
      useCases: [
        { title: "Trace every agent run", slug: "trace-agent-runs" },
        { title: "Track cost and tokens", slug: "cost-tracking", mostAsked: "Cost tracking" },
        { title: "Gate releases on latency", slug: "release-gates" }
      ]
    },
    {
      id: "agentic-chaos",
      name: "Agentic Chaos",
      summary: "Break tools on purpose before production does.",
      useCases: [
        { title: "Simulate tool failures", slug: "tool-failures", mostAsked: "Tool failures" },
        { title: "Test timeouts and rate limits", slug: "timeouts-rate-limits" },
        { title: "Catch drift before production", slug: "drift-testing" }
      ]
    },
    {
      id: "agentic-sidecar",
      name: "Agentic Sidecar",
      summary: "Check every action before the agent takes it.",
      useCases: [
        { title: "Block unsafe actions", slug: "block-unsafe-actions", mostAsked: "Unsafe actions" },
        { title: "Check actions against intent", slug: "intent-checks" },
        { title: "Enforce team policies", slug: "policy-enforcement" }
      ]
    },
    {
      id: "agentic-evals",
      name: "Agentic Evals",
      summary: "Score answers and block bad releases in CI.",
      useCases: [
        { title: "Score agent answers", slug: "score-answers" },
        { title: "Check tool-call paths", slug: "trajectory-checks" },
        { title: "Block bad releases in CI", slug: "ci-gate", mostAsked: "CI gate" }
      ]
    },
    {
      id: "mcp",
      name: "MCP Server",
      summary: "Every tool from one MCP client.",
      useCases: [
        { title: "All tools from one client", slug: "one-client" },
        { title: "Validate runs against the spec", slug: "spec-validation" },
        { title: "Connect your AI assistant", slug: "connect-assistant" }
      ]
    },
    {
      id: "control-tower",
      name: "Control Tower",
      summary: "See and manage every agent in one place.",
      useCases: [
        { title: "See every agent in one place", slug: "agent-registry", mostAsked: "Agent registry" },
        { title: "Spot agents that need attention", slug: "needs-attention" },
        { title: "Manage agents across teams", slug: "fleet-control" }
      ]
    }
  ]
};
