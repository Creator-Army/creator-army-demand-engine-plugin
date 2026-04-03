import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../../client.ts"
import type { CreatorArmyConfig } from "../../config.ts"
import { log } from "../../logger.ts"

export function registerBriefTools(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "demand_engine_list_briefs",
			label: "List Creative Briefs",
			description:
				"List creative briefs. Optionally filter by brand name. Briefs contain the selling sequence, hooks, building blocks, and creative type for an ad concept.",
			parameters: Type.Object({
				brand: Type.Optional(Type.String({ description: "Filter by brand name" })),
				limit: Type.Optional(Type.Number({ description: "Max results (default 20)" })),
				offset: Type.Optional(Type.Number({ description: "Pagination offset" })),
			}),
			async execute(
				_id: string,
				params: { brand?: string; limit?: number; offset?: number },
			) {
				log.debug(`listing briefs: brand=${params.brand ?? "all"}`)
				const data = await client.listBriefs(params)
				if (data.briefs.length === 0) {
					return {
						content: [{ type: "text" as const, text: "No briefs found." }],
						details: {},
					}
				}
				const list = data.briefs
					.map((b) => `- **${b.title}** (${b.brandName}) — ${b.creativeType ?? "untyped"}, ${b.customerType ?? "general"}`)
					.join("\n")
				return {
					content: [{ type: "text" as const, text: `${data.total} brief(s):\n\n${list}` }],
					details: { total: data.total },
				}
			},
		},
		{ name: "demand_engine_list_briefs" },
	)

	api.registerTool(
		{
			name: "demand_engine_get_brief",
			label: "Get Creative Brief",
			description: "Get a single creative brief by ID with full selling sequence and hooks.",
			parameters: Type.Object({
				id: Type.String({ description: "Brief ID" }),
			}),
			async execute(_id: string, params: { id: string }) {
				log.debug(`getting brief: ${params.id}`)
				const brief = await client.getBrief(params.id)
				if (!brief) {
					return {
						content: [{ type: "text" as const, text: "Brief not found." }],
						details: {},
					}
				}
				return {
					content: [{ type: "text" as const, text: JSON.stringify(brief, null, 2) }],
					details: { id: brief._id, title: brief.title },
				}
			},
		},
		{ name: "demand_engine_get_brief" },
	)

	api.registerTool(
		{
			name: "demand_engine_save_brief",
			label: "Save Creative Brief",
			description:
				"Save a new creative brief with selling sequence, hooks, building blocks, and creative type. This is Steps 2-3 of the demand engine.",
			parameters: Type.Object({
				brandName: Type.String({ description: "Brand name" }),
				title: Type.String({ description: "Brief title" }),
				customerType: Type.Optional(Type.String({ description: "Target customer type" })),
				sellingSequence: Type.Optional(
					Type.Object({
						rapport: Type.Optional(Type.String()),
						openLoop: Type.Optional(Type.String()),
						valueStack: Type.Optional(Type.String()),
						wowMoment: Type.Optional(Type.String()),
						cta: Type.Optional(Type.String()),
					}),
				),
				hooks: Type.Optional(Type.Array(Type.String(), { description: "Hook options" })),
				buildingBlocks: Type.Optional(Type.Array(Type.String(), { description: "Persuasion building blocks used" })),
				creativeType: Type.Optional(Type.String({ description: "Ad format (e.g. founder-to-camera, ugc, mashup)" })),
				platform: Type.Optional(Type.String({ description: "Target platform (e.g. meta, tiktok)" })),
				duration: Type.Optional(Type.Number({ description: "Target duration in seconds" })),
				notes: Type.Optional(Type.String({ description: "Production or strategy notes" })),
			}),
			async execute(_id: string, params: Record<string, unknown>) {
				log.debug(`saving brief: ${params.title}`)
				const brief = await client.saveBrief(params)
				return {
					content: [{ type: "text" as const, text: `Saved brief "${brief.title}" for ${brief.brandName}.` }],
					details: { id: brief._id, title: brief.title },
				}
			},
		},
		{ name: "demand_engine_save_brief" },
	)
}
