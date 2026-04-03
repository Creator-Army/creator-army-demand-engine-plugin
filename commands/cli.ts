import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import * as readline from "node:readline"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

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
					const configPath = path.join(
						os.homedir(),
						".openclaw",
						"openclaw.json",
					)
					const envKey = process.env.CREATOR_ARMY_API_KEY

					console.log("\nCreator Army Status\n")

					let apiKeySource = ""
					let apiKeyDisplay = ""

					if (envKey) {
						apiKeySource = "environment"
						apiKeyDisplay = `${envKey.slice(0, 8)}...${envKey.slice(-4)}`
					}

					if (fs.existsSync(configPath)) {
						try {
							const config = JSON.parse(
								fs.readFileSync(configPath, "utf-8"),
							)
							const entry =
								config?.plugins?.entries?.["openclaw-creator-army"]
							if (entry?.config?.apiKey && !envKey) {
								const key = entry.config.apiKey as string
								apiKeySource = "config"
								apiKeyDisplay = `${key.slice(0, 8)}...${key.slice(-4)}`
							}
						} catch {
							console.log("Could not read config file\n")
							return
						}
					}

					if (!apiKeyDisplay) {
						console.log("No API key configured")
						console.log("Run: openclaw creator-army setup\n")
						return
					}

					console.log(
						`API key: ${apiKeyDisplay} (from ${apiKeySource})`,
					)
					console.log("")
				})
		},
		{ commands: ["creator-army"] },
	)
}

export function registerCli(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerCli(
		// biome-ignore lint/suspicious/noExplicitAny: openclaw SDK does not ship types
		({ program }: { program: any }) => {
			const cmd = program.commands.find(
				// biome-ignore lint/suspicious/noExplicitAny: openclaw SDK does not ship types
				(c: any) => c.name() === "creator-army",
			)
			if (!cmd) return

			cmd
				.command("search")
				.argument("<query>", "Search query")
				.option("--limit <n>", "Max results", "5")
				.action(async (query: string, opts: { limit: string }) => {
					const limit = Number.parseInt(opts.limit, 10) || 5
					log.debug(`cli search: query="${query}" limit=${limit}`)

					const results = await client.search(query, limit)

					if (results.length === 0) {
						console.log("No memories found.")
						return
					}

					for (const r of results) {
						const score = r.similarity
							? ` (${(r.similarity * 100).toFixed(0)}%)`
							: ""
						console.log(`- ${r.content}${score}`)
					}
				})

			cmd
				.command("health")
				.description("Check Creator Army API health and verify API key")
				.action(async () => {
					console.log("\nChecking Creator Army API...")
					const result = await client.health()
					if (result.success) {
						console.log("API is healthy and API key is valid.\n")
					} else {
						console.log(`API check failed: ${result.message}\n`)
					}
				})
		},
		{ commands: ["creator-army"] },
	)
}
