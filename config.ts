export type CreatorArmyConfig = {
	apiKey: string | undefined
	baseUrl: string
	debug: boolean
}

const ALLOWED_KEYS = ["apiKey", "baseUrl", "debug"]

function assertAllowedKeys(
	value: Record<string, unknown>,
	allowed: string[],
	label: string,
): void {
	const unknown = Object.keys(value).filter((k) => !allowed.includes(k))
	if (unknown.length > 0) {
		throw new Error(`${label} has unknown keys: ${unknown.join(", ")}`)
	}
}

export function parseConfig(raw: unknown): CreatorArmyConfig {
	const cfg =
		raw && typeof raw === "object" && !Array.isArray(raw)
			? (raw as Record<string, unknown>)
			: {}

	if (Object.keys(cfg).length > 0) {
		assertAllowedKeys(cfg, ALLOWED_KEYS, "creator-army config")
	}

	const apiKey =
		typeof cfg.apiKey === "string" && cfg.apiKey.length > 0
			? cfg.apiKey
			: undefined

	const baseUrl =
		typeof cfg.baseUrl === "string" && cfg.baseUrl.length > 0
			? cfg.baseUrl.replace(/\/+$/, "")
			: "https://b2a9-2403-580c-1dcc-0-181c-7d6e-4733-3836.ngrok-free.app"

	return {
		apiKey,
		baseUrl,
		debug: (cfg.debug as boolean) ?? false,
	}
}

export const creatorArmyConfigSchema = {
	jsonSchema: {
		type: "object",
		additionalProperties: false,
		properties: {
			apiKey: { type: "string" },
			baseUrl: { type: "string" },
			debug: { type: "boolean" },
		},
	},
	parse: parseConfig,
}
