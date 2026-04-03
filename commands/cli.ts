import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import * as readline from "node:readline"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { parseConfig } from "../config.ts"

export function registerCliSetup(api: OpenClawPluginApi): void {
	api.registerCli(
		// biome-ignore lint/suspicious/noExplicitAny: openclaw SDK does not ship types
		({ program }: { program: any }) => {
			const cmd = program
				.command("creator-army")
				.description("Creator Army plugin commands")

			cmd
				.command("setup")
				.description("Configure Creator Army API key")
				.action(async () => {
					const configDir = path.join(os.homedir(), ".openclaw")
					const configPath = path.join(configDir, "openclaw.json")

					console.log("\nCreator Army Setup\n")
					console.log("Enter your Creator Army API key:\n")

					const rl = readline.createInterface({
						input: process.stdin,
						output: process.stdout,
					})

					const apiKey = await new Promise<string>((resolve) => {
						rl.question("API key: ", resolve)
					})
					rl.close()

					if (!apiKey.trim()) {
						console.log("\nNo API key provided. Setup cancelled.")
						return
					}

					let config: Record<string, unknown> = {}
					if (fs.existsSync(configPath)) {
						try {
							config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
						} catch {
							config = {}
						}
					}

					if (!config.plugins) config.plugins = {}
					const plugins = config.plugins as Record<string, unknown>
					if (!plugins.entries) plugins.entries = {}
					const entries = plugins.entries as Record<string, unknown>

					entries["openclaw-creator-army"] = {
						enabled: true,
						config: {
							apiKey: apiKey.trim(),
						},
					}

					if (!fs.existsSync(configDir)) {
						fs.mkdirSync(configDir, { recursive: true })
					}

					fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

					console.log("\nAPI key saved to ~/.openclaw/openclaw.json")
					console.log(
						"Restart OpenClaw to apply changes: openclaw gateway --force\n",
					)
				})

			cmd
				.command("status")
				.description("Check Creator Army configuration status")
				.action(async () => {
					const cfg = parseConfig(api.pluginConfig)

					console.log("\nCreator Army Status\n")

					if (!cfg.apiKey) {
						console.log("No API key configured")
						console.log("Run: openclaw creator-army setup\n")
						return
					}

					const display = `${cfg.apiKey.slice(0, 8)}...${cfg.apiKey.slice(-4)}`
					console.log(`API key: ${display}`)
					console.log(`Base URL: ${cfg.baseUrl}`)
					console.log(`Debug: ${cfg.debug}`)
					console.log("")
				})

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
		},
		{ commands: ["creator-army"] },
	)
}

export function registerCli(
	_api: OpenClawPluginApi,
	_client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {}
