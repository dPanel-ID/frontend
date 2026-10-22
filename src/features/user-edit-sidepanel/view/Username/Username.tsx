import { useDevetekTranslations } from '@/services/i18n';

export interface UsernameProps {
  value: string;
}

export default function Username(props: UsernameProps) {
  const t = useDevetekTranslations();

  return (
    <section className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {t('sidepanel.userEdit.username')}
      </span>
      <p
        id="profile-username"
        className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
      >
        @{props.value}
      </p>
      <p className="text-xs text-muted-foreground">
        {t('sidepanel.userEdit.usernameReadonly')}
      </p>
    </section>
  );
}
