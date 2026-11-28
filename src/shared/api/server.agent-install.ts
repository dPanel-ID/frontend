import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  /** Optional server name; the API names it `new-server` when empty. */
  hostname?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const hostname = params.hostname?.trim();

  return {
    method: 'POST',
    url: '/v1/server/agent-install',
    data: hostname ? { hostname } : {},
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  /** The server, in progress until its agent connects. */
  server?: DTOs.MachineV1;
  /**
   * One line to run on the machine. It carries a single-use enrollment code
   * valid for 2 hours, so it is shown to the person who asked for it only.
   */
  command?: string;
  /** The same command for a shell that is already root (no sudo). */
  root_command?: string;
  /** The same command with wget, for a machine without curl. */
  wget_command?: string;
  /** RFC 3339 time the code stops working. */
  expires_at?: string;
}

/** Records a server and returns the one-line agent install command for it. */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>(recipe(params));
}
