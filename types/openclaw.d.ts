declare module "openclaw/plugin-sdk" {
	export interface OpenClawPluginApi {
		on(event: "before_agent_start", handler: () => { prependContext: string }): void
	}
}
