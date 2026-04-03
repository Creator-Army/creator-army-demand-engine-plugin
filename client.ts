import { log } from "./logger.ts"

const BASE_URL = "https://api.creatorarmy.com"

export type SearchResult = {
	id: string
	content: string
	similarity?: number
	metadata?: Record<string, unknown>
}

export class CreatorArmyClient {
	private apiKey: string

	constructor(apiKey: string) {
		if (!apiKey) {
			throw new Error("Creator Army API key is required")
		}
		this.apiKey = apiKey
		log.info("client initialized")
	}

	private async request<T>(
		method: string,
		path: string,
		body?: Record<string, unknown>,
	): Promise<T> {
		log.debugRequest(`${method} ${path}`, body ?? {})

		const response = await fetch(`${BASE_URL}${path}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			...(body && { body: JSON.stringify(body) }),
		})

		if (!response.ok) {
			const text = await response.text()
			throw new Error(`Creator Army API error (${response.status}): ${text}`)
		}

		const data = (await response.json()) as T
		log.debugResponse(`${method} ${path}`, data)
		return data
	}

	async health(): Promise<{ success: boolean; message?: string }> {
		try {
			const data = await this.request<{ success: boolean; message?: string }>(
				"GET",
				"/api/plugin/health",
			)
			return data
		} catch (err) {
			return {
				success: false,
				message: err instanceof Error ? err.message : "Unknown error",
			}
		}
	}

	async search(query: string, limit = 5): Promise<SearchResult[]> {
		return this.request<SearchResult[]>("POST", "/v1/search", {
			query,
			limit,
		})
	}

	async store(
		content: string,
		metadata?: Record<string, string | number | boolean>,
	): Promise<{ id: string }> {
		return this.request<{ id: string }>("POST", "/v1/memories", {
			content,
			...(metadata && { metadata }),
		})
	}

	async forget(id: string): Promise<{ success: boolean }> {
		return this.request<{ success: boolean }>("DELETE", `/v1/memories/${id}`)
	}

	async forgetByQuery(
		query: string,
	): Promise<{ success: boolean; message: string }> {
		const results = await this.search(query, 1)
		if (results.length === 0) {
			return { success: false, message: "No matching memory found to forget." }
		}

		await this.forget(results[0].id)
		const preview =
			results[0].content.length > 100
				? `${results[0].content.slice(0, 100)}…`
				: results[0].content
		return { success: true, message: `Forgot: "${preview}"` }
	}
}
