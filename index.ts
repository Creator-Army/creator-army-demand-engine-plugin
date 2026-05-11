import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"

const here = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(here, "skills", "creator-army-demand-engine", "SKILL.md")

export default {
	id: "openclaw-creatorarmy-demand-engine",
	name: "Creator Army Demand Engine",
	description:
		"Creator Army demand creation skill — short-form video ads and organic content.",
	kind: "tool" as const,
	configSchema: {
		type: "object",
		properties: {},
		additionalProperties: false,
	} as const,

	register(api: OpenClawPluginApi) {
		const skill = readFileSync(SKILL_PATH, "utf-8")
		api.on("before_agent_start", () => ({ prependContext: skill }))
	},
}
