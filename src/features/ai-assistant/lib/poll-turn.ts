import { ApiAi } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

const POLL_INTERVAL_MS = 2000;
const POLL_LIMIT_MS = 6 * 60 * 1000;

export type TurnOutcome =
  | { ok: true; result: DTOs.AiChatResultV1 }
  | { ok: false; error: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls an asynchronous assistant turn until it completes or fails. Turns run
 * in the background on the server, so long answers are not cut by proxy
 * response limits.
 */
export async function pollTurn(
  turnId: string,
  fallbackError: string,
): Promise<TurnOutcome> {
  const deadline = Date.now() + POLL_LIMIT_MS;
  while (Date.now() < deadline) {
    const response = await ApiAi.Turns.$Id.fetchGet({ turnId });
    if (response.$status !== 'success') {
      return { ok: false, error: getApiErrorDetail(response.error) };
    }
    if (response.status === 'completed') {
      return { ok: true, result: response.result ?? {} };
    }
    if (response.status === 'failed') {
      return { ok: false, error: response.error || fallbackError };
    }
    await wait(POLL_INTERVAL_MS);
  }
  return { ok: false, error: fallbackError };
}
