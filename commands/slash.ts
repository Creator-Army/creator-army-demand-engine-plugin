import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

export function registerStubCommands(api: OpenClawPluginApi): void {
	api.registerCommand({
		name: "remember",
		description: "Save something to Creator Army memory",
		acceptsArgs: true,
		requireAuth: true,
		handler: async () => {
			return {
				text: "Creator Army not configured. Set your API key first.",
			}
		},
	})

	api.registerCommand({
		name: "recall",
		description: "Search your Creator Army memories",
		acceptsArgs: true,
		requireAuth: true,
		handler: async () => {
			return {
				text: "Creator Army not configured. Set your API key first.",
			}
		},
	})
}

export function registerCommands(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerCommand({
		name: "remember",
		description: "Save something to Creator Army memory",
		acceptsArgs: true,
		requireAuth: true,
		handler: async (ctx: { args?: string }) => {
			const text = ctx.args?.trim()
			if (!text) {
				return { text: "Usage: /remember <text to remember>" }
			}

			log.debug(`/remember command: "${text.slice(0, 50)}"`)

			try {
				await client.store(text, { source: "openclaw_command" })
				const preview = text.length > 60 ? `${text.slice(0, 60)}…` : text
				return { text: `Remembered: "${preview}"` }
			} catch (err) {
				log.error("/remember failed", err)
				return { text: "Failed to save memory. Check logs for details." }
			}
		},
	})

	api.registerCommand({
		name: "recall",
		description: "Search your Creator Army memories",
		acceptsArgs: true,
		requireAuth: true,
		handler: async (ctx: { args?: string }) => {
			const query = ctx.args?.trim()
			if (!query) {
				return { text: "Usage: /recall <search query>" }
			}

			log.debug(`/recall command: "${query}"`)

			try {
				const results = await client.search(query, 5)

				if (results.length === 0) {
					return { text: `No memories found for: "${query}"` }
				}

				const lines = results.map((r, i) => {
					const score = r.similarity
						? ` (${(r.similarity * 100).toFixed(0)}%)`
						: ""
					return `${i + 1}. ${r.content}${score}`
				})

				return {
					text: `Found ${results.length} memories:\n\n${lines.join("\n")}`,
				}
			} catch (err) {
				log.error("/recall failed", err)
				return { text: "Failed to search memories. Check logs for details." }
			}
		},
	})
}
