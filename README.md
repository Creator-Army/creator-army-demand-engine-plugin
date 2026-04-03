# @creatorarmy/openclaw-creatorarmy

OpenClaw plugin for Creator Army — tools and commands for managing short-form video ad and organic content creation workflows via the Creator Army API.

## Install

```bash
openclaw install @creatorarmy/openclaw-creatorarmy
```

Requires OpenClaw `>=2026.1.29`.

## Setup

```bash
openclaw creator-army setup
```

You'll be prompted for your Creator Army API key. Check your connection with:

```bash
openclaw creator-army status
```

## Commands

| Command | Description |
|---|---|
| `/health` | Verify API connection |
| `/brands` | List all configured brands |
| `/briefs [brand]` | List creative briefs (optionally filtered by brand) |

## Demand Engine Tools

The plugin provides 12 tools for the full content creation workflow:

### Brand Context
- `demand_engine_list_brands` — List all brands
- `demand_engine_get_context` — Get brand context (personality, tone, ICP, etc.)
- `demand_engine_save_context` — Create/update brand context

### Customer Excavation
- `demand_engine_get_excavation` — Get customer research (barriers, motivators, core problem)
- `demand_engine_save_excavation` — Save excavation data

### Creative Briefs
- `demand_engine_list_briefs` — List briefs
- `demand_engine_get_brief` — Get full brief details
- `demand_engine_save_brief` — Create brief with selling sequence, hooks, platform, duration

### Scripts
- `demand_engine_list_scripts` — List ad scripts
- `demand_engine_get_script` — Get full script with persuasion checklist
- `demand_engine_save_script` — Generate new ad script

### References
- `demand_engine_list_references` — List reference docs (hook science, selling sequences, etc.)
- `demand_engine_get_reference` — Fetch reference doc by slug

## License

MIT
