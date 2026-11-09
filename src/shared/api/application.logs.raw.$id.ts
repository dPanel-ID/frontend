import { axiosClient, createQueryParams } from '@/shared/libs/api-client';

export interface RawLogParams {
  applicationId: string;
  machineId: string;
  timeGte: string;
  timeLt: string;
}

export interface RawLogOptions {
  signal?: AbortSignal;
  /** Called as bytes arrive. */
  onProgress?: (fetchedBytes: number) => void;
}

/**
 * One server's log exactly as the application wrote it. A log cut off by the
 * server rejects instead of resolving with part of the file.
 */
export async function download(
  params: RawLogParams,
  options: RawLogOptions = {},
): Promise<Blob> {
  const { applicationId, machineId, timeGte, timeLt } = params;
  const query = createQueryParams({
    machine_id: machineId,
    time_gte: timeGte,
    time_lt: timeLt,
  });

  try {
    const response = await axiosClient.get<Blob>(
      `/v1/application/${applicationId}/logs/raw?${query.toString()}`,
      {
        responseType: 'blob',
        signal: options.signal,
        onDownloadProgress: (event) => options.onProgress?.(event.loaded),
      },
    );
    return response.data;
  } catch (error) {
    throw await rawLogError(error);
  }
}

/** A refused download's JSON error arrives as a blob too. */
async function rawLogError(error: unknown): Promise<Error> {
  const body = (error as { response?: { data?: unknown } }).response?.data;
  if (body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text()) as { error?: unknown };
      if (typeof parsed.error === 'string' && parsed.error) {
        return new Error(parsed.error);
      }
    } catch {
      // Not the API's JSON; fall through to the original error.
    }
  }
  return error instanceof Error ? error : new Error(String(error));
}
