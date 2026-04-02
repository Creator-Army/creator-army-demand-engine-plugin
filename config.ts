export type CreatorArmyConfig = {
	apiKey: string | undefined
	debug: boolean
}

const ALLOWED_KEYS = ["apiKey", "debug"]

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

function resolveEnvVars(value: string): string {
	return value.replace(/\$\{([^}]+)\}/g, (_, envVar: string) => {
		const envValue = process.env[envVar]
		if (!envValue) {
			throw new Error(`Environment variable ${envVar} is not set`)
		}
		return envValue
	})
}

export function parseConfig(raw: unknown): CreatorArmyConfig {
	const cfg =
		raw && typeof raw === "object" && !Array.isArray(raw)
			? (raw as Record<string, unknown>)
			: {}

	if (Object.keys(cfg).length > 0) {
		assertAllowedKeys(cfg, ALLOWED_KEYS, "creator-army config")
	}

	let apiKey: string | undefined
	try {
		apiKey =
			typeof cfg.apiKey === "string" && cfg.apiKey.length > 0
				? resolveEnvVars(cfg.apiKey)
				: process.env.CREATOR_ARMY_API_KEY
	} catch {
		apiKey = undefined
	}

	return {
		apiKey,
		debug: (cfg.debug as boolean) ?? false,
	}
}

export const creatorArmyConfigSchema = {
	jsonSchema: {
		type: "object",
		additionalProperties: false,
		properties: {
			apiKey: { type: "string" },
			debug: { type: "boolean" },
		},
	},
	parse: parseConfig,
}
