import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { CreatorArmyClient } from "./client.ts"
import { registerCli, registerCliSetup } from "./commands/cli.ts"
import { registerCommands, registerStubCommands } from "./commands/slash.ts"
import { parseConfig, creatorArmyConfigSchema } from "./config.ts"
import { buildSkillLoaderHandler } from "./hooks/skill-loader.ts"
import { initLogger } from "./logger.ts"
import { registerBriefTools } from "./tools/demand-engine/briefs.ts"
import { registerContextTools } from "./tools/demand-engine/context.ts"
import { registerExcavationTools } from "./tools/demand-engine/excavation.ts"
import { registerReferenceTools } from "./tools/demand-engine/references.ts"
import { registerScriptTools } from "./tools/demand-engine/scripts.ts"

export default {
	id: "openclaw-creatorarmy",
	name: "Creator Army",
	description: "OpenClaw Creator Army plugin — demand engine for short-form video ads and organic content",
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

		// Load SKILL.md into agent context on every conversation start
		api.on("before_agent_start", buildSkillLoaderHandler(client, cfg))

		// Demand Engine tools
		registerReferenceTools(api, client, cfg)
		registerContextTools(api, client, cfg)
		registerExcavationTools(api, client, cfg)
		registerBriefTools(api, client, cfg)
		registerScriptTools(api, client, cfg)

		// Slash commands & CLI
		registerCommands(api, client, cfg)
		registerCli(api, client, cfg)

		api.registerService({
			id: "openclaw-creatorarmy",
			start: () => {
				api.logger.info("creator-army: connected")
			},
			stop: () => {
				api.logger.info("creator-army: stopped")
			},
		})
	},
}
