import type { Response } from './rules/types';

function collectErrorText(error: unknown) {
  const messages: string[] = [];

  if (error instanceof Error) {
    messages.push(error.message);
  }

  if (error && typeof error === 'object') {
    if ('errorMessage' in error && typeof error.errorMessage === 'string') {
      messages.push(error.errorMessage);
    }

    if ('response' in error) {
      const response = error.response;

      if (response && typeof response === 'object' && 'data' in response) {
        const data = response.data;

        if (typeof data === 'string') {
          messages.push(data);
        } else if (data && typeof data === 'object') {
          if ('error' in data && typeof data.error === 'string') {
            messages.push(data.error);
          }

          if ('message' in data && typeof data.message === 'string') {
            messages.push(data.message);
          }
        }
      }
    }
  }

  return messages.join('\n').toLowerCase();
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object') return 0;

  if ('status' in error) {
    const status = Number(error.status);
    if (status > 0) return status;
  }

  if ('code' in error) {
    const code = Number(error.code);
    if (code > 0) return code;
  }

  if ('response' in error) {
    const response = error.response;

    if (response && typeof response === 'object' && 'status' in response) {
      const status = Number(response.status);
      if (status > 0) return status;
    }
  }

  return 0;
}

export function isGithubAuthFailure(response: Response<unknown>) {
  if (response.$status !== 'failed') return false;

  const message = collectErrorText(response.error);

  if (
    message.includes('bad credentials') ||
    message.includes('requires authentication')
  ) {
    return true;
  }

  if (response.kind !== 'api') return false;

  return getErrorStatus(response.error) === 401;
}
