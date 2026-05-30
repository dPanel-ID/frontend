import { useDevetekTranslations } from '@/services/i18n';

import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import { useDcContext } from '../../model';

export default function AvatarUrl() {
  const { form } = useDcContext();
  const t = useDevetekTranslations();
  const errorId = 'profile-avatar-url-error';
  const error = form.formState.errors.avatar_url?.message;

  return (
    <section className="flex flex-col gap-1.5">
      <label htmlFor="avatar_url" className="text-sm font-medium">
        {t('page.profile.modal.avatarUrl')}
      </label>
      <Input
        id="avatar_url"
        type="url"
        placeholder={t('page.profile.modal.avatarUrlPlaceholder')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...form.register('avatar_url')}
      />
      <p className="text-xs text-muted-foreground">
        {t('page.profile.modal.avatarUrlHelp')}
      </p>
      <ErrorInline id={errorId} message={error} t={t} />
    </section>
  );
}
