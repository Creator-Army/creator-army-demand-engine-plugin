import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../../client.ts"
import type { CreatorArmyConfig } from "../../config.ts"
import { log } from "../../logger.ts"

export function registerScriptTools(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "demand_engine_list_scripts",
			label: "List Scripts",
			description:
				"List generated ad scripts. Optionally filter by brand or brief ID.",
			parameters: Type.Object({
				brand: Type.Optional(Type.String({ description: "Filter by brand name" })),
				briefId: Type.Optional(Type.String({ description: "Filter by parent brief ID" })),
				limit: Type.Optional(Type.Number({ description: "Max results (default 20)" })),
				offset: Type.Optional(Type.Number({ description: "Pagination offset" })),
			}),
			async execute(
				_id: string,
				params: { brand?: string; briefId?: string; limit?: number; offset?: number },
			) {
				log.debug(`listing scripts: brand=${params.brand ?? "all"}`)
				const data = await client.listScripts(params)
				if (data.scripts.length === 0) {
					return {
						content: [{ type: "text" as const, text: "No scripts found." }],
						details: {},
					}
				}
				const list = data.scripts
					.map((s) => `- **${s.title}** (${s.brandName}) — ${s.format ?? "untyped"}, ${s.duration ?? "?"}s`)
					.join("\n")
				return {
					content: [{ type: "text" as const, text: `${data.total} script(s):\n\n${list}` }],
					details: { total: data.total },
				}
			},
		},
		{ name: "demand_engine_list_scripts" },
	)

	api.registerTool(
		{
			name: "demand_engine_get_script",
			label: "Get Script",
			description: "Get a single ad script by ID with full body, selling sequence, and persuasion checklist.",
			parameters: Type.Object({
				id: Type.String({ description: "Script ID" }),
			}),
			async execute(_id: string, params: { id: string }) {
				log.debug(`getting script: ${params.id}`)
				const script = await client.getScript(params.id)
				if (!script) {
					return {
						content: [{ type: "text" as const, text: "Script not found." }],
						details: {},
					}
				}
				return {
					content: [{ type: "text" as const, text: JSON.stringify(script, null, 2) }],
					details: { id: script._id, title: script.title },
				}
			},
		},
		{ name: "demand_engine_get_script" },
	)

	api.registerTool(
		{
			name: "demand_engine_save_script",
			label: "Save Script",
			description:
				"Save a generated ad script with hook, open loop, body, CTA, selling sequence, building blocks, and persuasion checklist. This is Steps 3-4 of the demand engine.",
			parameters: Type.Object({
				brandName: Type.String({ description: "Brand name" }),
				title: Type.String({ description: "Script title" }),
				briefId: Type.Optional(Type.String({ description: "Parent brief ID" })),
				customerType: Type.Optional(Type.String({ description: "Target customer type" })),
				format: Type.Optional(Type.String({ description: "Ad format (e.g. founder-to-camera, ugc)" })),
				platform: Type.Optional(Type.String({ description: "Target platform" })),
				duration: Type.Optional(Type.Number({ description: "Duration in seconds" })),
				hook: Type.Optional(Type.String({ description: "The hook (first 3 seconds)" })),
				openLoop: Type.Optional(Type.String({ description: "The open loop (seconds 3-10)" })),
				body: Type.Optional(Type.String({ description: "Full script body with timestamps and directions" })),
				cta: Type.Optional(Type.String({ description: "Call to action" })),
				sellingSequence: Type.Optional(
					Type.Object({
						rapport: Type.Optional(Type.String()),
						openLoop: Type.Optional(Type.String()),
						valueStack: Type.Optional(Type.String()),
						wowMoment: Type.Optional(Type.String()),
						cta: Type.Optional(Type.String()),
					}),
				),
				buildingBlocks: Type.Optional(Type.Array(Type.String(), { description: "Persuasion building blocks used" })),
				persuasionChecklist: Type.Optional(
					Type.Object({
						ethos: Type.Optional(Type.Boolean({ description: "Credibility/trust signal present" })),
						logos: Type.Optional(Type.Boolean({ description: "Data or demonstration present" })),
						pathos: Type.Optional(Type.Boolean({ description: "Makes viewer feel something" })),
						metaphor: Type.Optional(Type.Boolean({ description: "Concept is tangible/clear" })),
						brevity: Type.Optional(Type.Boolean({ description: "Can cut 30% and lose nothing" })),
					}),
				),
				notes: Type.Optional(Type.String({ description: "Production notes" })),
			}),
			async execute(_id: string, params: Record<string, unknown>) {
				log.debug(`saving script: ${params.title}`)
				const script = await client.saveScript(params)
				return {
					content: [{ type: "text" as const, text: `Saved script "${script.title}" for ${script.brandName}.` }],
					details: { id: script._id, title: script.title },
				}
			},
		},
		{ name: "demand_engine_save_script" },
	)
}
