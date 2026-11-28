import { useEffect, useRef, useState } from 'react';

import { ApiApplication } from '@/shared/api';

import { presetKey } from '../-lib/laravel-preset';
import { useFormStore } from '../-model/store/form';

export type PresetLoadStatus = 'idle' | 'loading' | 'done' | 'failed';

function githubOwnerAndName(repositoryUrl: string) {
  const path = repositoryUrl
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
  const [owner = '', name = ''] = path.split('/');
  return { owner, name };
}

/**
 * Asks dPanel which settings suit the chosen repository and branch, and
 * applies them once per repository@branch when it recognises the
 * framework (Laravel today). Every field stays editable afterwards; a
 * failed lookup leaves the form as it is, so the flow still works by hand.
 */
export function useLaravelPreset(): { status: PresetLoadStatus } {
  const [
    flowMode,
    appSourceGithubRepo,
    gitRepoConfig,
    appDomain,
    applyPreset,
    clearPreset,
  ] = useFormStore((s) => [
    s.flowMode,
    s.appSourceGithubRepo,
    s.gitRepoConfig,
    s.appDomain,
    s.applyPreset,
    s.clearPreset,
  ]);
  const [status, setStatus] = useState<PresetLoadStatus>('idle');
  const requestedKeyRef = useRef('');

  const repository = appSourceGithubRepo ?? '';
  const branch = gitRepoConfig?.gitBranch || gitRepoConfig?.gitDefaultBranch;
  const key = repository && branch ? presetKey(repository, branch) : '';

  useEffect(() => {
    if (flowMode !== 'create' || !key || requestedKeyRef.current === key) {
      return;
    }
    const { owner, name } = githubOwnerAndName(repository);
    if (!owner || !name) return;

    requestedKeyRef.current = key;
    const controller = new AbortController();
    const load = async () => {
      setStatus('loading');
      const response = await ApiApplication.Preset.doGet(
        { owner, repo: name, branch, domain: appDomain },
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      if (response.$status !== 'success') {
        // Asked again when the user picks this repository again.
        requestedKeyRef.current = '';
        setStatus('failed');
        return;
      }
      if (!applyPreset(response, key)) clearPreset();
      setStatus('done');
    };
    void load();

    return () => {
      controller.abort();
      if (requestedKeyRef.current === key) requestedKeyRef.current = '';
    };
    // appDomain only shapes APP_URL; a later domain change is not a reason
    // to apply the preset over the user's edits again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyPreset, branch, clearPreset, flowMode, key, repository]);

  return { status };
}
