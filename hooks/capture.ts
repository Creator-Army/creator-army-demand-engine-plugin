import type { CreatorArmyClient } from "../client.ts"
import type { CreatorArmyConfig } from "../config.ts"
import { log } from "../logger.ts"

export function buildCaptureHandler(
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
) {
	return async (
		event: Record<string, unknown>,
		_ctx: Record<string, unknown>,
	) => {
		if (
			!event.success ||
			!Array.isArray(event.messages) ||
			event.messages.length === 0
		)
			return

		const texts: string[] = []
		for (const msg of event.messages) {
			if (!msg || typeof msg !== "object") continue
			const msgObj = msg as Record<string, unknown>
			const role = msgObj.role
			if (role !== "user" && role !== "assistant") continue

			const content = msgObj.content
			const parts: string[] = []

			if (typeof content === "string") {
				parts.push(content)
			} else if (Array.isArray(content)) {
				for (const block of content) {
					if (!block || typeof block !== "object") continue
					const b = block as Record<string, unknown>
					if (b.type === "text" && typeof b.text === "string") {
						parts.push(b.text)
					}
				}
			}

			if (parts.length > 0) {
				texts.push(`[${role}]: ${parts.join("\n")}`)
			}
		}

		if (texts.length === 0) return

		const content = texts.join("\n\n")
		log.debug(`capturing ${texts.length} messages (${content.length} chars)`)

		try {
			await client.store(content, {
				source: "openclaw_auto",
				timestamp: new Date().toISOString(),
			})
		} catch (err) {
			log.error("capture failed", err)
		}
	}
}
