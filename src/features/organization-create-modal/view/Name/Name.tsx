import { useDevetekTranslations } from '@/services/i18n';

import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { TextArea } from '@/shared/presentation/atoms/TextArea';

import { useDcContext } from '../../model';

export default function Name() {
  const { form } = useDcContext();
  const t = useDevetekTranslations();

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="workspace-name">
          {t('modal.createTeam.fieldName')}{' '}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <Input
          id="workspace-name"
          variant="3d"
          placeholder={t('modal.createTeam.namePlaceholder')}
          aria-invalid={!!form.formState.errors.name}
          aria-describedby="workspace-name-help workspace-name-error"
          autoComplete="organization"
          {...form.register('name')}
        />
        <p id="workspace-name-help" className="text-xs text-primary/55">
          {t('modal.createTeam.nameHelp')}
        </p>
        <ErrorInline
          message={form.formState.errors.name?.message}
          id="workspace-name-error"
        />
      </section>

      <section className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="workspace-description">
          {t('common.terms.description')}
        </label>
        <TextArea
          id="workspace-description"
          placeholder={t('modal.createTeam.descPlaceholder')}
          rows={3}
          aria-invalid={!!form.formState.errors.description}
          aria-describedby="workspace-description-help workspace-description-error"
          {...form.register('description')}
        />
        <p id="workspace-description-help" className="text-xs text-primary/55">
          {t('modal.createTeam.descriptionHelp')}
        </p>
        <ErrorInline
          message={form.formState.errors.description?.message}
          id="workspace-description-error"
        />
      </section>
    </div>
  );
}
