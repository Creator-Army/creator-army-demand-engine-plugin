import { log } from "./logger.ts"

export type Reference = {
	slug: string
	filename: string
	content?: string
}

export type BrandContext = {
	_id: string
	email?: string
	brandName: string
	brandUrl?: string
	personality?: string
	tone?: string
	visualStyle?: string
	icp?: string
	customerTypes?: string[]
	barriers?: string[]
	motivators?: string[]
	notes?: string
	createdAt?: string
	updatedAt?: string
}

export type CustomerType = {
	name: string
	description?: string
	barriers?: string[]
	motivators?: string[]
}

export type Excavation = {
	_id: string
	brandName: string
	customerTypes?: CustomerType[]
	coreProblem?: string
	failedSolutions?: string
	desiredOutcome?: string
	uniqueMechanism?: string
	notes?: string
	createdAt?: string
	updatedAt?: string
}

export type SellingSequence = {
	rapport?: string
	openLoop?: string
	valueStack?: string
	wowMoment?: string
	cta?: string
}

export type Brief = {
	_id: string
	brandName: string
	title: string
	customerType?: string
	sellingSequence?: SellingSequence
	hooks?: string[]
	buildingBlocks?: string[]
	creativeType?: string
	platform?: string
	duration?: number
	notes?: string
	createdAt?: string
	updatedAt?: string
}

export type PersuasionChecklist = {
	ethos?: boolean
	logos?: boolean
	pathos?: boolean
	metaphor?: boolean
	brevity?: boolean
}

export type Script = {
	_id: string
	brandName: string
	briefId?: string
	title: string
	customerType?: string
	format?: string
	platform?: string
	duration?: number
	hook?: string
	openLoop?: string
	body?: string
	cta?: string
	sellingSequence?: SellingSequence
	buildingBlocks?: string[]
	persuasionChecklist?: PersuasionChecklist
	notes?: string
	createdAt?: string
	updatedAt?: string
}

export class CreatorArmyClient {
	private apiKey: string
	private baseUrl: string

	constructor(apiKey: string, baseUrl: string) {
		if (!apiKey) {
			throw new Error("Creator Army API key is required")
		}
		this.apiKey = apiKey
		this.baseUrl = baseUrl
		log.info(`client initialized (${baseUrl})`)
	}

	private async request<T>(
		method: string,
		path: string,
		body?: Record<string, unknown>,
	): Promise<T> {
		log.debugRequest(`${method} ${path}`, body ?? {})

		const response = await fetch(`${this.baseUrl}${path}`, {
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

	// Health

	async health(): Promise<{ ok: boolean; message?: string }> {
		try {
			const data = await this.request<{ status: string; keyPrefix?: string }>(
				"GET",
				"/api/plugin/health",
			)
			return { ok: data.status === "ok" }
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Unknown error",
			}
		}
	}

	// References

	async listReferences(): Promise<Reference[]> {
		const data = await this.request<{ references: Reference[] }>(
			"GET",
			"/api/plugin/demand-engine/references",
		)
		return data.references
	}

	async getReference(slug: string): Promise<Reference> {
		return this.request<Reference>(
			"GET",
			`/api/plugin/demand-engine/references?ref=${encodeURIComponent(slug)}`,
		)
	}

	// Brand Context

	async listBrands(): Promise<BrandContext[]> {
		const data = await this.request<{ brands: BrandContext[] }>(
			"GET",
			"/api/plugin/demand-engine/context",
		)
		return data.brands
	}

	async getBrandContext(brand: string): Promise<BrandContext | null> {
		const data = await this.request<{ context: BrandContext | null }>(
			"GET",
			`/api/plugin/demand-engine/context?brand=${encodeURIComponent(brand)}`,
		)
		return data.context
	}

	async saveBrandContext(
		context: Record<string, unknown>,
	): Promise<BrandContext> {
		const data = await this.request<{ context: BrandContext }>(
			"POST",
			"/api/plugin/demand-engine/context",
			context,
		)
		return data.context
	}

	// Excavation

	async getExcavation(brand: string): Promise<Excavation | null> {
		const data = await this.request<{ excavation: Excavation | null }>(
			"GET",
			`/api/plugin/demand-engine/excavation?brand=${encodeURIComponent(brand)}`,
		)
		return data.excavation
	}

	async saveExcavation(
		excavation: Record<string, unknown>,
	): Promise<Excavation> {
		const data = await this.request<{ excavation: Excavation }>(
			"POST",
			"/api/plugin/demand-engine/excavation",
			excavation,
		)
		return data.excavation
	}

	// Briefs

	async listBriefs(params?: {
		brand?: string
		limit?: number
		offset?: number
	}): Promise<{ briefs: Brief[]; total: number }> {
		const query = new URLSearchParams()
		if (params?.brand) query.set("brand", params.brand)
		if (params?.limit) query.set("limit", String(params.limit))
		if (params?.offset) query.set("offset", String(params.offset))
		const qs = query.toString()
		return this.request<{ briefs: Brief[]; total: number }>(
			"GET",
			`/api/plugin/demand-engine/briefs${qs ? `?${qs}` : ""}`,
		)
	}

	async getBrief(id: string): Promise<Brief | null> {
		const data = await this.request<{ brief: Brief | null }>(
			"GET",
			`/api/plugin/demand-engine/briefs?id=${encodeURIComponent(id)}`,
		)
		return data.brief
	}

	async saveBrief(brief: Record<string, unknown>): Promise<Brief> {
		const data = await this.request<{ brief: Brief }>(
			"POST",
			"/api/plugin/demand-engine/briefs",
			brief,
		)
		return data.brief
	}

	// Scripts

	async listScripts(params?: {
		brand?: string
		briefId?: string
		limit?: number
		offset?: number
	}): Promise<{ scripts: Script[]; total: number }> {
		const query = new URLSearchParams()
		if (params?.brand) query.set("brand", params.brand)
		if (params?.briefId) query.set("briefId", params.briefId)
		if (params?.limit) query.set("limit", String(params.limit))
		if (params?.offset) query.set("offset", String(params.offset))
		const qs = query.toString()
		return this.request<{ scripts: Script[]; total: number }>(
			"GET",
			`/api/plugin/demand-engine/scripts${qs ? `?${qs}` : ""}`,
		)
	}

	async getScript(id: string): Promise<Script | null> {
		const data = await this.request<{ script: Script | null }>(
			"GET",
			`/api/plugin/demand-engine/scripts?id=${encodeURIComponent(id)}`,
		)
		return data.script
	}

	async saveScript(script: Record<string, unknown>): Promise<Script> {
		const data = await this.request<{ script: Script }>(
			"POST",
			"/api/plugin/demand-engine/scripts",
			script,
		)
		return data.script
	}
}
