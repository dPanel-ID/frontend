import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { FileTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { schemaCreateServerSearch } from './-rules/search';
import { CreateChooser } from './-view/create-chooser';
import { ManualConnect } from './-view/manual-connect';

export const Route = createFileRoute('/_with-app-layout/servers/create/')({
  component: CreateNewServerPage,
  validateSearch: zodValidator(schemaCreateServerSearch),
});

function CreateNewServerPage() {
  const t = useDevetekTranslations();
  const { mode } = Route.useSearch();
  const isManual = mode === 'manual';

  return (
    <>
      <title>{t('page.servers.create.documentTitle')}</title>

      {!isManual && (
        <PageHeader
          headnote={
            <Breadcrumb
              items={[
                { text: t('sidebar.dashboard'), url: '/dashboard' },
                { text: t('sidebar.servers'), url: '/servers' },
              ]}
            />
          }
          title={t('page.servers.create.headerTitle')}
          description={t('page.servers.create.headerDesc')}
          rightAppend={
            <Button variant="outline" size="sm" asChild>
              <a
                href={LINK__DOCUMENTATION}
                aria-label={t('page.servers.docs')}
                title={t('page.servers.docs')}
                target="_blank"
                rel="noreferrer"
              >
                <FileTextIcon className="size-4" />
                <span className="hidden sm:inline">
                  {t('page.servers.docs')}
                </span>
              </a>
            </Button>
          }
        />
      )}

      {isManual ? <ManualConnect /> : <CreateChooser />}
    </>
  );
}
