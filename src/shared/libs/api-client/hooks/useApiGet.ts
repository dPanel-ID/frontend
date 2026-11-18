import { useCallback, useEffect, useRef, useState } from 'react';

import { AxiosError, isCancel } from 'axios';

import { iife } from '../../browser/fn';
import { isOnline } from '../../browser/is-online';
import useHandler from '../../react-hooks/useHandler';
import { axiosClient } from '../lib/client';
import {
  BaseResponseError,
  isBaseResponseFailure,
  normalizeApiError,
} from '../lib/error';
import type {
  BaseResponse,
  GetRequestRecipe,
  Response,
  ResponseError,
  UseApiGetOptions,
} from '../rules/types';

export default function useApiGet<D>(
  config: GetRequestRecipe,
  options?: UseApiGetOptions,
) {
  const {
    autoRetryWhenFails = false,
    skip = false,
    refreshIntervalMs = 0,
    silentRefresh = false,
    refetchOnVisible = false,
  } = options ?? {};
  const { url } = config;
  // Headers take part in identity (a workspace header changes the answer),
  // so a change refetches like a new URL does.
  const headersKey = config.headers ? JSON.stringify(config.headers) : '';

  const [response, setResponse] = useState<Response<D>>({
    $status: 'initial',
  });
  // When the last successful answer arrived (client clock), so a caller can
  // tell a fresh reading from one the page has held for a while.
  const [receivedAt, setReceivedAt] = useState<number>();

  const refResponse = useRef<Response<D>>(null);

  const refAbortController = useRef<AbortController>(null);
  const refAutoRetryWhenFails = useRef<boolean>(null);
  const refSilentRefresh = useRef(silentRefresh);
  const refBusy = useRef(false);

  if (refAutoRetryWhenFails.current == null) {
    refAutoRetryWhenFails.current = autoRetryWhenFails;
  }

  if (refResponse.current == null) {
    refResponse.current = response;
  }

  const abortFetch = useHandler(() => {
    refAbortController.current?.abort();
    refAbortController.current = null;
    refBusy.current = false;
  });

  const fetchData = useCallback(
    ({ abortInFlight = true, background = false } = {}) => {
      const isInFlight =
        !!refAbortController.current &&
        !refAbortController.current.signal.aborted;
      if (!abortInFlight && isInFlight) return;

      if (abortInFlight) {
        abortFetch();
      }

      const controller = new AbortController();
      refAbortController.current = controller;
      refBusy.current = true;

      // A silent background refresh leaves the last good answer on screen:
      // no loading state in between, and a failure keeps that answer.
      const keepShown =
        background &&
        !!refSilentRefresh.current &&
        refResponse.current?.$status === 'success';

      if (!keepShown) {
        setResponse((prevResponse) => {
          let prevData: D | undefined;
          let prevError: ResponseError | undefined;

          if (prevResponse.$status === 'success') {
            prevData = prevResponse;
          } else if (prevResponse.$status === 'failed') {
            prevError = prevResponse;
          }

          return {
            $status: 'loading',
            prevData,
            prevError,
          };
        });
      }

      axiosClient<BaseResponse<D>>({
        method: 'GET',
        url,
        headers: headersKey ? JSON.parse(headersKey) : undefined,
        signal: controller.signal,
      })
        .then((axiosResponse) => {
          if (refAbortController.current !== controller) return;

          const baseData = axiosResponse.data;

          if (isBaseResponseFailure(baseData)) {
            throw new BaseResponseError(baseData);
          }

          if (baseData.data == null) {
            throw Error('Data is empty!');
          }

          const data =
            typeof baseData.data === 'object'
              ? (baseData.data as Response<D>)
              : ({ value: baseData.data } as unknown as Response<D>);
          data.$status = 'success';

          setResponse(data);
          setReceivedAt(Date.now());
        })
        .catch((error) => {
          if (refAbortController.current !== controller) return;

          if (isCancel(error)) {
            return;
          }

          if (keepShown) return;

          if (refAutoRetryWhenFails.current) {
            // eslint-disable-next-line react-hooks/immutability
            fetchData({ abortInFlight });
            return;
          }

          const normalizedError = normalizeApiError(error);

          setResponse({
            $status: 'failed',
            ...iife((): ResponseError => {
              if (
                normalizedError instanceof AxiosError ||
                normalizedError instanceof BaseResponseError
              ) {
                return {
                  kind: 'api',
                  error: normalizedError,
                };
              }

              return {
                kind: 'general',
                error:
                  normalizedError instanceof Error
                    ? normalizedError
                    : Error(String(normalizedError)),
              };
            }),
          });
        })
        .finally(() => {
          if (refAbortController.current !== controller) return;

          refAbortController.current = null;
          refBusy.current = false;
        });
    },
    [url, headersKey, abortFetch],
  );

  useEffect(() => {
    refAutoRetryWhenFails.current = autoRetryWhenFails;
    refSilentRefresh.current = silentRefresh;
    refResponse.current = response;
  });

  useEffect(() => {
    if (skip) {
      abortFetch();
      // Intentional: the in-flight request (an external system) is aborted
      // here, and the response must reset in the same step to stay in sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResponse({ $status: 'initial' });
      setReceivedAt(undefined);
      return;
    }

    fetchData();
    return abortFetch;
  }, [skip, url, headersKey, fetchData, abortFetch]);

  useEffect(() => {
    if (skip || refreshIntervalMs <= 0) return;

    const interval = window.setInterval(() => {
      const shouldSkip =
        !isOnline() ||
        (refetchOnVisible && isPageHidden()) ||
        (!refAutoRetryWhenFails.current &&
          refResponse.current?.$status === 'failed');

      if (shouldSkip) return;

      fetchData({ abortInFlight: false, background: true });
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(interval);
      abortFetch();
    };
  }, [abortFetch, fetchData, refetchOnVisible, refreshIntervalMs, skip]);

  useEffect(() => {
    if (skip || !refetchOnVisible) return;

    const onVisibilityChange = () => {
      if (isPageHidden() || !isOnline()) return;
      fetchData({ abortInFlight: false, background: true });
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchData, refetchOnVisible, skip]);

  return [response, fetchData, { receivedAt }] as const;
}

function isPageHidden() {
  return (
    typeof document !== 'undefined' && document.visibilityState === 'hidden'
  );
}
