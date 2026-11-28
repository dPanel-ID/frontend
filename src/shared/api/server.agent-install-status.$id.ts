import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `v1/server/${params.serverId}/agent/install-status`,
  };
}

// =============================================================================
//   Dto
// =============================================================================

/**
 * How far a server's latest install command got: not run yet
 * (script_downloaded_at null), run, stopped with a reason, or connected.
 */
export interface Dto {
  status?: string;
  error?: string;
  /** True once the server's agent connected to dPanel. */
  connected?: boolean;
  /** RFC 3339 time the install command was run on a machine, or null. */
  script_downloaded_at?: string | null;
  /** Stable reason the install stopped (for example no_systemd), or ''. */
  install_reason?: string;
  /** What the reason means, in English. */
  install_reason_text?: string;
  install_reported_at?: string | null;
}
