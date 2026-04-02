import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

export function buildRecallHandler(
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
) {
	return async (event: Record<string, unknown>) => {
		const rawPrompt = event.prompt as string | undefined
		if (!rawPrompt || rawPrompt.length < 5) return

		log.debug(`recalling for prompt: "${rawPrompt.slice(0, 50)}"`)

		try {
			const results = await client.search(rawPrompt, 5)

			if (results.length === 0) {
				log.debug("no memories to inject")
				return
			}

			const lines = results.map((r) => `- ${r.content}`)
			const context = [
				"<creator-army-context>",
				"The following is background context from Creator Army memory. Use it silently to inform your responses.",
				"",
				...lines,
				"",
				"Do not proactively bring up memories. Only use them when relevant.",
				"</creator-army-context>",
			].join("\n")

			log.debug(`injecting ${results.length} memories`)
			return { prependContext: context }
		} catch (err) {
			log.error("recall failed", err)
			return
		}
	}
}
