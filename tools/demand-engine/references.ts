import { Type } from "@sinclair/typebox"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import type { CreatorArmyClient } from "../../client.ts"
import type { CreatorArmyConfig } from "../../config.ts"
import { log } from "../../logger.ts"

export function registerReferenceTools(
	api: OpenClawPluginApi,
	client: CreatorArmyClient,
	_cfg: CreatorArmyConfig,
): void {
	api.registerTool(
		{
			name: "demand_engine_list_references",
			label: "List Reference Docs",
			description:
				"List all available Creator Army demand engine reference documents (hook science, selling sequence, creative types, etc).",
			parameters: Type.Object({}),
			async execute() {
				log.debug("listing references")
				const refs = await client.listReferences()
				const list = refs.map((r) => `- ${r.slug} (${r.filename})`).join("\n")
				return {
					content: [{ type: "text" as const, text: `Available references:\n\n${list}` }],
					details: { count: refs.length },
				}
			},
		},
		{ name: "demand_engine_list_references" },
	)

	api.registerTool(
		{
			name: "demand_engine_get_reference",
			label: "Get Reference Doc",
			description:
				"Fetch a specific Creator Army demand engine reference document by slug. Use demand_engine_list_references to see available slugs. Contains frameworks for hooks, selling sequences, creative types, campaign architecture, and more.",
			parameters: Type.Object({
				slug: Type.String({
					description:
						"Reference slug (e.g. hook-science, selling-sequence, creative-types, customer-excavation, context-scan, building-blocks, lo-fi-production, campaign-architecture, learning-loop, case-studies)",
				}),
			}),
			async execute(_id: string, params: { slug: string }) {
				log.debug(`fetching reference: ${params.slug}`)
				const ref = await client.getReference(params.slug)
				return {
					content: [{ type: "text" as const, text: ref.content ?? "No content found." }],
					details: { slug: ref.slug, filename: ref.filename },
				}
			},
		},
		{ name: "demand_engine_get_reference" },
	)
}
