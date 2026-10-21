import type { ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { DashboardSection } from '../../-presentation';

export default function CompactListSection(props: {
  title: string;
  description: string;
  to: string;
  children: ReactNode;
}) {
  const { children, description, title, to } = props;
  const t = useDevetekTranslations('page.dashboard');

  return (
    <DashboardSection
      title={title}
      description={description}
      action={
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {t('viewAll')}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-2">{children}</div>
    </DashboardSection>
  );
}
