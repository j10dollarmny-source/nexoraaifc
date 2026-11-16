<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- AI provider calls live only in `src/lib/ai/provider.server.ts` (server-only); UI reads connection state via `getAiStatus`. Why: keeps keys server-side and one swap point for the provider.
- Plan data lives in `src/lib/plans.ts`, shared by pricing page and tests. Why: single source of truth for plans.
- Visual redesigns reuse shared CSS tokens and existing site components; keep decorative bitmap art separate from the static chat demonstration. Why: consistent styling without changing behavior or implying a live integration.
- Account assistant threads use route-derived IDs, RLS-protected UIMessage storage, AI Elements, and streaming OpenRouter calls in provider.server.ts; verify live zero pricing plus zero-price provider ceilings and reserve durable shared quota slots before every attempt. Why: keeps keys private, prevents paid selection and concurrent quota overshoot, and isolates the assistant from the unconnected customer chatbot.
