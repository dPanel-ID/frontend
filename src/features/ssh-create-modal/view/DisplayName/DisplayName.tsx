import { useDevetekTranslations } from '@/services/i18n';

import { InputWithValidation } from '@/shared/presentation/molecules/InputWithValidation';

import { useSSHCreateContext } from '../../model';

/** The only field the user has to think about: what to call this key. */
export default function DisplayName() {
  const { setDisplayName } = useSSHCreateContext();
  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold">
        {t('page.sshKeys.create.nameLabel')}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('page.sshKeys.create.nameDescription')}
      </p>

      <InputWithValidation
        placeholder={t('page.sshKeys.create.namePlaceholder')}
        onAcceptedChange={setDisplayName}
        validations={[
          /^[a-zA-Z0-9\s_-]+$/,
          (value) =>
            value.length > 100 ? t('page.sshKeys.create.nameTooLong') : true,
        ]}
      />
    </div>
  );
}
