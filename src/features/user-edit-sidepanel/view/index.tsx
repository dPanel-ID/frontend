import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { DcProvider } from '../model';
import type { UserEditSidepanelProps as Props } from '../model/types';

import { Actions } from './Actions';
import { AvatarUrl } from './AvatarUrl';
import { Fullname } from './Fullname';
import { PasswordFields } from './PasswordFields';
import { Username } from './Username';

export default function UserEditSidepanel(props: Props) {
  const { user } = props;
  const t = useDevetekTranslations();

  return (
    <DcProvider {...props}>
      <Layout>
        <Layout.Title
          title={t('sidepanel.userEdit.title')}
          subtitle={user.fullname || user.username}
          hasCloseButton
        />

        <Layout.Content className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('sidepanel.userEdit.description')}
          </p>

          {user.email && (
            <section className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                {t('sidepanel.userEdit.email')}
              </span>
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('sidepanel.userEdit.emailReadonly')}
              </p>
            </section>
          )}

          <Fullname />
          <Username value={user.username} />
          <AvatarUrl />
          <PasswordFields />
        </Layout.Content>

        <Layout.Cta className="gap-y-2">
          <Actions />
        </Layout.Cta>
      </Layout>
    </DcProvider>
  );
}
