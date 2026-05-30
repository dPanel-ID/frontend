import { useDevetekTranslations } from '@/services/i18n';

import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import { useDcContext } from '../../model';

export default function Fullname() {
  const { form } = useDcContext();
  const t = useDevetekTranslations();
  const errorId = 'profile-fullname-error';
  const error = form.formState.errors.fullname?.message;

  return (
    <section className="flex flex-col gap-1.5">
      <label htmlFor="fullname" className="text-sm font-medium">
        {t('page.profile.modal.fullName')}
      </label>
      <Input
        id="fullname"
        placeholder={t('page.profile.modal.fullNamePlaceholder')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...form.register('fullname')}
      />
      <ErrorInline id={errorId} message={error} t={t} />
    </section>
  );
}
