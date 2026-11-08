import { useState } from 'react';

import { ListChecksIcon, ScrollTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import SegmentedControl from '@/shared/presentation/atoms/SegmentedControl';

import type { ArtifactLogsModalProps } from '../rules/types';

import BuildLogOutput from './BuildLogOutput';
import BuildSteps from './BuildSteps';

type BuildLogView = 'steps' | 'output';

/**
 * A build in two views: where it is, step by step, and what it printed. The
 * output only arrives after each step ends, so the steps open first.
 */
const Content = (props: ArtifactLogsModalProps) => {
  const t = useDevetekTranslations(
    'page.applicationDetail.releases.buildProgress',
  );
  const [view, setView] = useState<BuildLogView>('steps');

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <SegmentedControl<BuildLogView>
        activeItemId={view}
        onClickOption={setView}
        options={[
          { id: 'steps', icon: ListChecksIcon, text: t('tabSteps') },
          { id: 'output', icon: ScrollTextIcon, text: t('tabOutput') },
        ]}
      />
      {view === 'steps' ? (
        <BuildSteps {...props} />
      ) : (
        <BuildLogOutput {...props} />
      )}
    </div>
  );
};

export default function ArtifactLogsModal(props: ArtifactLogsModalProps) {
  const { commitHead } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases');

  return (
    <ModalLayoutGeneral maxWidth="1280px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('artifactLogsTitle')}
        description={t('artifactLogsDescription', { commit: commitHead })}
      />

      <ModalLayoutGeneral.Content className="min-h-0 overflow-hidden">
        <Content {...props} />
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}
