import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

let cachedSkill: string | null = null

export function buildSkillLoaderHandler(
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
) {
	return async () => {
		if (cachedSkill) {
			return { prependContext: cachedSkill }
		}

		try {
			const ref = await client.getReference("skill")
			if (ref.content) {
				cachedSkill = ref.content
				log.debug(`loaded SKILL.md (${cachedSkill.length} chars)`)
				return { prependContext: cachedSkill }
			}
		} catch (err) {
			log.error("failed to load SKILL.md", err)
		}

		return
	}
}
