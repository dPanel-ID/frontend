import { useDevetekTranslations } from '@/services/i18n';

import type { EnvTextError } from '@/entities/application/lib/env-text';

export type EnvErrorPlace = 'line' | 'row';

/** The message for one error, naming a text line or a row. */
export function useEnvErrorMessage() {
  const t = useDevetekTranslations('widget.envVariablesEditor.errors');

  return (error: EnvTextError, place: EnvErrorPlace) => {
    const values = {
      line: error.line,
      first: error.firstLine ?? error.line,
      key: error.key ?? '',
    };
    if (place === 'row') {
      switch (error.code) {
        case 'missingKey':
          return t('rowMissingKey');
        case 'invalidKey':
          return t('rowInvalidKey');
        case 'duplicateKey':
          return t('rowDuplicateKey', values);
        default:
          return t(error.code, values);
      }
    }
    return t(error.code, values);
  };
}
