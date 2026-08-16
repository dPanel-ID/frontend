import { Link } from '@tanstack/react-router';

import type { HostGroupMember } from '@/entities/host-group/rules/schema';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { FailedState } from '@/widgets/failed-state';

interface MembersTableProps {
  errorMessage?: string;
  members: HostGroupMember[];
  onRemoveMember: (member: HostGroupMember) => void;
  onRetry?: () => Promise<void> | void;
  pendingMemberAction?: 'add' | 'replace' | `remove:${string}` | null;
}

export function MembersTable(props: MembersTableProps) {
  const {
    errorMessage,
    members,
    onRemoveMember,
    onRetry,
    pendingMemberAction,
  } = props;

  return (
    <div className="grid gap-3">
      {errorMessage ? (
        <div aria-live="polite" role="status">
          <FailedState.BannerRetryable
            classNameWrapper="shadow-none"
            onClickRetry={onRetry ?? (() => {})}
          />
          <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Server</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current group</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isRemoving = pendingMemberAction === `remove:${member.id}`;

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <Link
                    className="text-primary hover:underline"
                    params={{ id: member.id }}
                    to="/servers/$id"
                  >
                    {member.hostname}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.address || '-'}
                </TableCell>
                <TableCell>{member.status || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.currentHostGroupId || '-'}
                </TableCell>
                <TableCell>
                  <Button
                    buttonColor="secondary"
                    buttonStyle="outline"
                    disabled={pendingMemberAction != null}
                    onClick={() => onRemoveMember(member)}
                    size="sm"
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
