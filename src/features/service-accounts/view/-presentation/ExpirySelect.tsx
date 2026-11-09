import { useDevetekTranslations } from '@/services/i18n';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';

import { EXPIRY_DAYS } from '../../rules/types';

import Field from './Field';

/** How long a token works. */
export default function ExpirySelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { onChange, value } = props;
  const t = useDevetekTranslations('widget.serviceAccounts.form');

  return (
    <Field
      label={t('expiry')}
      hint={value === '0' ? t('expiryNoneWarning') : t('expiryHint')}
    >
      {({ id }) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_DAYS.map((days) => (
              <SelectItem key={days} value={days}>
                {t(`expiryOptions.d${days}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}
