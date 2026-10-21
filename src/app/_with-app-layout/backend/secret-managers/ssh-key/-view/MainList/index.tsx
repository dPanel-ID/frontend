import { useDevetekTranslations } from '@/services/i18n';

import { buildResponseView } from '@/widgets/response-view-builder';

import { SshListState } from '../-presentation/SshListState';
import { toSshKeyCard } from '../../-lib/describe-ssh-key';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import { useSshKeyDataModel } from '../../-model/ssh-key-data';

import SshCard from './SshCard';
import { SshKeyRow } from './SshKeyRow';
import { SshKeysEmptyState } from './SshKeysEmptyState';
import SshTable from './SshTable';
import { useSshKeyHandlers } from './useSshKeyHandlers';

export default buildResponseView({
  useResponse: () => useSshKeyDataModel((s) => s.sshKeys),
  fallbackError: SshListState.Error,
  fallbackLoading: SshListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const t = useDevetekTranslations();
    const emit = useEmit();
    const handlersFor = useSshKeyHandlers();
    const [derivedViewMode, searchQuery] = useFilterModel((s) => [
      s.derivedViewMode,
      s.searchQuery,
    ]);

    const sshKeys = list.flatMap((secret) => {
      const card = toSshKeyCard(secret, t('page.sshKeys.detail.fallbackName'));
      return card ? [card] : [];
    });

    if (sshKeys.length < 1) {
      return (
        <SshKeysEmptyState
          filtered={Boolean(searchQuery)}
          onClearSearch={() => {
            emit('@ssh-keys/filters/search--input', undefined);
            emit('@ssh-keys/filters/pagination--set', 1);
          }}
          onCreate={() => emit('@ssh-keys/add-new', undefined)}
        />
      );
    }

    if (derivedViewMode === 'table') {
      return <SshTable sshKeys={sshKeys} handlersFor={handlersFor} />;
    }

    if (derivedViewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sshKeys.map((sshKey) => (
            <SshCard
              key={sshKey.id}
              sshKey={sshKey}
              handlers={handlersFor(sshKey)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {sshKeys.map((sshKey) => (
          <SshKeyRow
            key={sshKey.id}
            sshKey={sshKey}
            handlers={handlersFor(sshKey)}
          />
        ))}
      </div>
    );
  },
});
