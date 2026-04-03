import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../../client.ts"
import type { CreatorArmyConfig } from "../../config.ts"
import { log } from "../../logger.ts"

export function registerExcavationTools(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "demand_engine_get_excavation",
			label: "Get Customer Excavation",
			description:
				"Get customer excavation data for a brand — customer types with their barriers and motivators, core problem, failed solutions, desired outcome, and unique mechanism. This is Step 1 of the demand engine.",
			parameters: Type.Object({
				brand: Type.String({ description: "Brand name" }),
			}),
			async execute(_id: string, params: { brand: string }) {
				log.debug(`getting excavation for: ${params.brand}`)
				const exc = await client.getExcavation(params.brand)
				if (!exc) {
					return {
						content: [{ type: "text" as const, text: `No excavation found for "${params.brand}". Use demand_engine_save_excavation to create one.` }],
						details: {},
					}
				}
				return {
					content: [{ type: "text" as const, text: JSON.stringify(exc, null, 2) }],
					details: { brandName: exc.brandName },
				}
			},
		},
		{ name: "demand_engine_get_excavation" },
	)

	api.registerTool(
		{
			name: "demand_engine_save_excavation",
			label: "Save Customer Excavation",
			description:
				"Create or update customer excavation data (upserts by brandName). Save customer types with barriers/motivators, core problem, failed solutions, desired outcome, and unique mechanism.",
			parameters: Type.Object({
				brandName: Type.String({ description: "Brand name" }),
				customerTypes: Type.Optional(
					Type.Array(
						Type.Object({
							name: Type.String({ description: "Customer type name" }),
							description: Type.Optional(Type.String({ description: "Description of this customer type" })),
							barriers: Type.Optional(Type.Array(Type.String(), { description: "Their purchase barriers" })),
							motivators: Type.Optional(Type.Array(Type.String(), { description: "What motivates them to buy" })),
						}),
					),
				),
				coreProblem: Type.Optional(Type.String({ description: "The core problem customers face" })),
				failedSolutions: Type.Optional(Type.String({ description: "What they tried that didn't work" })),
				desiredOutcome: Type.Optional(Type.String({ description: "What they want to achieve" })),
				uniqueMechanism: Type.Optional(Type.String({ description: "Why this product works when others didn't" })),
				notes: Type.Optional(Type.String({ description: "Additional notes" })),
			}),
			async execute(_id: string, params: Record<string, unknown>) {
				log.debug(`saving excavation for: ${params.brandName}`)
				const exc = await client.saveExcavation(params)
				return {
					content: [{ type: "text" as const, text: `Saved excavation for "${exc.brandName}".` }],
					details: { brandName: exc.brandName },
				}
			},
		},
		{ name: "demand_engine_save_excavation" },
	)
}
