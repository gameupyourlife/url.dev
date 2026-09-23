# PostHog Self-driving setup report

## Summary

PostHog Self-driving was configured with Session Replay and Error Tracking already enabled, and Support (Conversations) enabled during this run. Health checks, the three Error Tracking responders, and the Support responder were enabled.

Findings should start appearing in the [Self-driving inbox](https://eu.posthog.com/project/281577/inbox) within about 30 minutes once sources begin producing data.

## AI data processing

Approved by the wizard's organization-level gate before this run.

## GitHub

The PostHog GitHub App was already connected before this run.

## Products enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | Already enabled | This is a web app and the `posthog.init` configuration does not disable recording. No recordings were returned by the availability check, so new recordings are still needed for Replay Vision. |
| Error Tracking | Already enabled | This is a web app and the client initialization explicitly enables exception capture. |
| Support (Conversations) | Enabled | Tickets will begin arriving only after an inbound email, inbox, or Slack channel is connected in PostHog. |

## Signal sources

| Source product | Source type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | On by default; no opt-out row existed, so no row was created. |
| `health_checks` | `health_issue` | Enabled. |
| `error_tracking` | `issue_created` | Enabled. |
| `error_tracking` | `issue_reopened` | Enabled. |
| `error_tracking` | `issue_spiking` | Enabled. |
| `conversations` | `ticket` | Enabled. |
| `session_replay` | `session_analysis_cluster` | Deliberately skipped: this retired source is replaced by Replay Vision scanners. |
| `replay_vision` | scanner findings | Deliberately not created as a source row; scanners self-authorize with `emits_signals`. Scanner creation was deferred because the MCP credential expired. |

## Connected tools

No external issue tracker, support desk, or other connected tool was selected: the single selection prompt timed out and was treated as a decline. No external responder was enabled.

## Scout troop

The scout troop could not be materialized or inspected because the PostHog MCP access credential expired while calling `scout-config-sync`, `scout-metadata-get`, and the fallback `scout-config-list`.

No scout configuration was changed. The enforced run budget could not be read; the published early-access default is 100 runs per day, not a verified project limit. Re-authenticate the PostHog MCP connection, then re-run setup to materialize and tune the troop. The intended initial selection for this web product is a general scout plus product-analytics and health-check specialists, while Error Tracking remains covered by its native responder and Session Replay by Replay Vision scanners.

## Custom scouts

No custom scouts were created. The proposal prompt could not be sent because the earlier interactive prompt timed out, and the skill store could not be read after the PostHog MCP credential expired.

The repository evidence identifies short-link creation and the sign-up-to-dashboard journey as the strongest candidates to assess after re-authentication. Any proposal should be shown for approval before creation and should only emit when a sustained conversion or completion regression exceeds the normal range; generic errors remain covered by Error Tracking. If a future custom scout is noisy, set `emit: false` on its PostHog config to switch it to dry-run.

## Replay Vision scanners

No Replay Vision scanners were created. The project currently has no recordings returned by the availability check, although Session Replay is enabled. Scanner inventory, quota sizing, and creation were then blocked by the expired PostHog MCP credential.

Once access is restored, create the two prescribed monitors for this product:

| Monitor brief | Intended scope | Status |
|---|---|---|
| Breakage monitor | The short-link creation completion flow, watching for visibly failed form submissions, validation feedback that blocks completion, or missing result states. | Deferred: scanner inventory and credit sizing unavailable. |
| Frustration monitor | Sessions containing rage clicks only, watching for repeated attempts to create, manage, or navigate short links. | Deferred: scanner inventory and credit sizing unavailable. |

A scanner is an LLM that watches individual session recordings on a schedule and pushes confirmed findings to the inbox. It is the only setup component here that spends Replay Vision quota. Findings arrive at half weight and need independent corroboration before promotion into a report.

## Files modified or created

| File | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup report. |
| `.claude/skills/replay-vision-scanners-core/` | Installed reference workflow only; no application code changed. |
| `.claude/skills/replay-vision-scanner-broken-experiences/` | Installed reference workflow only; no application code changed. |
| `.claude/skills/replay-vision-scanner-user-frustration/` | Installed reference workflow only; no application code changed. |

No application source code or environment files were changed.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so Support tickets can produce Self-driving findings.
- [ ] Re-authenticate the PostHog MCP connection: the access credential expired after native responders were enabled.
- [ ] Re-run the scout step after re-authentication to materialize the troop, read the enforced run budget, and enable the selective baseline.
- [ ] Re-run the custom-scout proposal after re-authentication and approve only the checks that are useful for the product.
- [ ] Re-run Replay Vision setup after re-authentication to inspect existing scanners, estimate quota, and create the two monitors.
- [ ] Generate some browser sessions so Session Replay has recordings for the Replay Vision monitors to analyze.

## What happens next

Fresh scout configurations, once enabled, are picked up by the coordinator within about 30 minutes and draw from the project daily budget. Native sources begin emitting when they receive relevant data; findings cluster into reports in the Self-driving inbox, where immediately actionable reports can start coding tasks.

For current source behavior and inbox configuration, see the [PostHog signal sources documentation](https://posthog.com/docs/self-driving/inbox/sources).
