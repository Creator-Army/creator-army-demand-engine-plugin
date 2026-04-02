import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

export function registerForgetTool(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "creator_army_forget",
			label: "Creator Army Forget",
			description:
				"Forget/delete a specific memory. Searches for the closest match and removes it.",
			parameters: Type.Object({
				query: Type.Optional(
					Type.String({ description: "Describe the memory to forget" }),
				),
				memoryId: Type.Optional(
					Type.String({ description: "Direct memory ID to delete" }),
				),
			}),
			async execute(
				_toolCallId: string,
				params: { query?: string; memoryId?: string },
			) {
				if (params.memoryId) {
					log.debug(`forget tool: direct delete id="${params.memoryId}"`)
					await client.forget(params.memoryId)
					return {
						content: [{ type: "text" as const, text: "Memory forgotten." }],
						details: {},
					}
				}

				if (params.query) {
					log.debug(`forget tool: search-then-delete query="${params.query}"`)
					const result = await client.forgetByQuery(params.query)
					return {
						content: [{ type: "text" as const, text: result.message }],
						details: {},
					}
				}

				return {
					content: [
						{
							type: "text" as const,
							text: "Provide a query or memoryId to forget.",
						},
					],
					details: {},
				}
			},
		},
		{ name: "creator_army_forget" },
	)
}
