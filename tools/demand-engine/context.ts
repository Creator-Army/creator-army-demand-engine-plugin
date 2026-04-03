import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../../client.ts"
import type { CreatorArmyConfig } from "../../config.ts"
import { log } from "../../logger.ts"

export function registerContextTools(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "demand_engine_list_brands",
			label: "List Brands",
			description: "List all brands with saved context in Creator Army.",
			parameters: Type.Object({}),
			async execute() {
				log.debug("listing brands")
				const brands = await client.listBrands()
				if (brands.length === 0) {
					return {
						content: [{ type: "text" as const, text: "No brands found. Use demand_engine_save_context to create one." }],
						details: {},
					}
				}
				const list = brands.map((b) => `- ${b.brandName}${b.brandUrl ? ` (${b.brandUrl})` : ""}`).join("\n")
				return {
					content: [{ type: "text" as const, text: `Brands:\n\n${list}` }],
					details: { count: brands.length },
				}
			},
		},
		{ name: "demand_engine_list_brands" },
	)

	api.registerTool(
		{
			name: "demand_engine_get_context",
			label: "Get Brand Context",
			description:
				"Get full brand context for a specific brand — personality, tone, visual style, ICP, customer types, barriers, motivators. This is Step 0 of the demand engine.",
			parameters: Type.Object({
				brand: Type.String({ description: "Brand name (case-insensitive)" }),
			}),
			async execute(_id: string, params: { brand: string }) {
				log.debug(`getting context for: ${params.brand}`)
				const ctx = await client.getBrandContext(params.brand)
				if (!ctx) {
					return {
						content: [{ type: "text" as const, text: `No context found for "${params.brand}". Run customer excavation to build it.` }],
						details: {},
					}
				}
				return {
					content: [{ type: "text" as const, text: JSON.stringify(ctx, null, 2) }],
					details: { brandName: ctx.brandName },
				}
			},
		},
		{ name: "demand_engine_get_context" },
	)

	api.registerTool(
		{
			name: "demand_engine_save_context",
			label: "Save Brand Context",
			description:
				"Create or update brand context (upserts by brandName). Save personality, tone, visual style, ICP, customer types, barriers, and motivators.",
			parameters: Type.Object({
				brandName: Type.String({ description: "Brand name" }),
				brandUrl: Type.Optional(Type.String({ description: "Brand website URL" })),
				personality: Type.Optional(Type.String({ description: "Brand personality" })),
				tone: Type.Optional(Type.String({ description: "Brand tone of voice" })),
				visualStyle: Type.Optional(Type.String({ description: "Visual style for content" })),
				icp: Type.Optional(Type.String({ description: "Ideal customer profile" })),
				customerTypes: Type.Optional(Type.Array(Type.String(), { description: "Customer type names" })),
				barriers: Type.Optional(Type.Array(Type.String(), { description: "Purchase barriers" })),
				motivators: Type.Optional(Type.Array(Type.String(), { description: "Purchase motivators" })),
				notes: Type.Optional(Type.String({ description: "Additional notes" })),
			}),
			async execute(_id: string, params: Record<string, unknown>) {
				log.debug(`saving context for: ${params.brandName}`)
				const ctx = await client.saveBrandContext(params)
				return {
					content: [{ type: "text" as const, text: `Saved brand context for "${ctx.brandName}".` }],
					details: { brandName: ctx.brandName },
				}
			},
		},
		{ name: "demand_engine_save_context" },
	)
}
