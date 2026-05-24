import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { IconServer } from '@/shared/presentation/icons';

import { useCommonModel } from '../../model/common';

const ServerName = () => {
  const [serverId, serverDetail] = useCommonModel((s) => [
    s.serverId,
    s.serverDetail,
  ]);

  if (
    serverDetail.$status === 'initial' ||
    serverDetail.$status === 'loading'
  ) {
    return <Spinner />;
  }

  if (serverDetail.$status === 'failed') {
    return `{${serverId}}`;
  }

  return serverDetail.hostname;
};

export default function Header() {
  return (
    <header className="flex min-w-0 shrink-0 flex-col justify-center px-4 py-3">
      <h3 className="truncate text-lg font-bold text-primary">File Manager</h3>
      <h6 className="flex items-center gap-1 overflow-hidden text-sm text-muted-foreground">
        <IconServer className="size-4" />
        <p className="line-clamp-1">
          <ServerName />
        </p>
      </h6>
    </header>
  );
}
