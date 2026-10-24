import { FileTextIcon, PackageIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import GithubAccountButton from '../../../-view/GithubAccountButton';

interface HeroProps {
  title: string;
  description: string;
  /** The update flow adds the application it is editing. */
  breadcrumbExtra?: { text: string; url: string };
}

/** Page opening in the same visual language as the rest of the product. */
export default function Hero(props: HeroProps) {
  const { breadcrumbExtra, description, title } = props;

  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={PackageIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('sidebar.applications'), url: '/applications' },
            ...(breadcrumbExtra ? [breadcrumbExtra] : []),
          ]}
        />
      }
      title={title}
      description={description}
      duration={t('page.applicationsCreate.heroDuration')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <GithubAccountButton />
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.applicationsCreate.docs')}
              title={t('page.applicationsCreate.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon className="size-4" />
              <span className="hidden sm:inline">
                {t('page.applicationsCreate.docs')}
              </span>
            </a>
          </Button>
        </div>
      }
    />
  );
}
