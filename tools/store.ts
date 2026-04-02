import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

export function registerStoreTool(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "creator_army_store",
			label: "Creator Army Store",
			description: "Save important information to Creator Army memory.",
			parameters: Type.Object({
				text: Type.String({ description: "Information to remember" }),
				category: Type.Optional(
					Type.String({ description: "Category for the memory" }),
				),
			}),
			async execute(
				_toolCallId: string,
				params: { text: string; category?: string },
			) {
				log.debug(`store tool: category="${params.category ?? "general"}"`)

				await client.store(params.text, {
					category: params.category ?? "general",
					source: "openclaw_tool",
				})

				const preview =
					params.text.length > 80
						? `${params.text.slice(0, 80)}…`
						: params.text

				return {
					content: [{ type: "text" as const, text: `Stored: "${preview}"` }],
					details: {},
				}
			},
		},
		{ name: "creator_army_store" },
	)
}
