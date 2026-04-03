import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { parseConfig } from "../config.ts"

export function registerHealthCommand(
	// biome-ignore lint/suspicious/noExplicitAny: openclaw SDK does not ship types
	cmd: any,
	api: OpenClawPluginApi,
): void {
	cmd
		.command("health")
		.description("Check Creator Army API health and verify API key")
		.action(async () => {
			const cfg = parseConfig(api.pluginConfig)
			if (!cfg.apiKey) {
				console.log("\nNo API key configured. Run: openclaw creator-army setup\n")
				return
			}

			console.log(`\nChecking ${cfg.baseUrl}/api/plugin/health ...`)
			try {
				const response = await fetch(`${cfg.baseUrl}/api/plugin/health`, {
					headers: { Authorization: `Bearer ${cfg.apiKey}` },
				})
				const text = await response.text()
				console.log(`Status: ${response.status}`)
				console.log(`Response: ${text}`)
				try {
					const data = JSON.parse(text) as Record<string, unknown>
					if (data.status === "ok") {
						console.log("API is healthy and API key is valid.\n")
					} else {
						console.log(`API check failed: ${data.error ?? data.message ?? data.status ?? "Unknown error"}\n`)
					}
				} catch {
					console.log("")
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Unknown error"
				console.log(`Connection failed: ${msg}\n`)
			}
		})
}
