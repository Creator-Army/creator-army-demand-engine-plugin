import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { CreatorArmyClient } from "./client.ts"
import { registerCli, registerCliSetup } from "./commands/cli.ts"
import { registerCommands, registerStubCommands } from "./commands/slash.ts"
import { parseConfig, creatorArmyConfigSchema } from "./config.ts"
import { buildCaptureHandler } from "./hooks/capture.ts"
import { buildRecallHandler } from "./hooks/recall.ts"
import { initLogger } from "./logger.ts"
import { registerForgetTool } from "./tools/forget.ts"
import { registerSearchTool } from "./tools/search.ts"
import { registerStoreTool } from "./tools/store.ts"

export default {
	id: "openclaw-creator-army",
	name: "Creator Army",
	description: "OpenClaw Creator Army plugin",
	kind: "tool" as const,
	configSchema: creatorArmyConfigSchema,

	register(api: OpenClawPluginApi) {
		const cfg = parseConfig(api.pluginConfig)

		initLogger(api.logger, cfg.debug)

		registerCliSetup(api)

		if (!cfg.apiKey) {
			api.logger.info(
				"creator-army: not configured - run 'openclaw creator-army setup'",
			)
			registerStubCommands(api)
			return
		}

		const client = new CreatorArmyClient(cfg.apiKey, cfg.baseUrl)

		registerSearchTool(api, client, cfg)
		registerStoreTool(api, client, cfg)
		registerForgetTool(api, client, cfg)

		api.on("before_agent_start", buildRecallHandler(client, cfg))
		api.on("agent_end", buildCaptureHandler(client, cfg))

		registerCommands(api, client, cfg)
		registerCli(api, client, cfg)

		api.registerService({
			id: "openclaw-creator-army",
			start: () => {
				api.logger.info("creator-army: connected")
			},
			stop: () => {
				api.logger.info("creator-army: stopped")
			},
		})
	},
}
