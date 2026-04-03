import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

export function registerStubCommands(api: OpenClawPluginApi): void {
	api.registerCommand({
		name: "health",
		description: "Check Creator Army API health",
		acceptsArgs: false,
		requireAuth: false,
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
		name: "health",
		description: "Check Creator Army API health and verify API key",
		acceptsArgs: false,
		requireAuth: false,
		handler: async () => {
			try {
				const result = await client.health()
				if (result.ok) {
					return { text: "Creator Army API is healthy and API key is valid." }
				}
				return { text: `Creator Army API check failed: ${result.message}` }
			} catch (err) {
				log.error("/health failed", err)
				return { text: "Failed to reach Creator Army API." }
			}
		},
	})

	api.registerCommand({
		name: "brands",
		description: "List all brands in Creator Army",
		acceptsArgs: false,
		requireAuth: true,
		handler: async () => {
			try {
				const brands = await client.listBrands()
				if (brands.length === 0) {
					return { text: "No brands found." }
				}
				const list = brands.map((b) => `- ${b.brandName}`).join("\n")
				return { text: `Brands:\n\n${list}` }
			} catch (err) {
				log.error("/brands failed", err)
				return { text: "Failed to list brands." }
			}
		},
	})

	api.registerCommand({
		name: "briefs",
		description: "List creative briefs (optionally pass brand name)",
		acceptsArgs: true,
		requireAuth: true,
		handler: async (ctx: { args?: string }) => {
			try {
				const brand = ctx.args?.trim() || undefined
				const data = await client.listBriefs({ brand })
				if (data.briefs.length === 0) {
					return { text: brand ? `No briefs found for "${brand}".` : "No briefs found." }
				}
				const list = data.briefs
					.map((b) => `- **${b.title}** (${b.brandName}) — ${b.creativeType ?? "untyped"}`)
					.join("\n")
				return { text: `${data.total} brief(s):\n\n${list}` }
			} catch (err) {
				log.error("/briefs failed", err)
				return { text: "Failed to list briefs." }
			}
		},
	})
}
