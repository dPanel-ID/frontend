import { Link } from '@tanstack/react-router';

import type { HostGroupOperationTarget } from '@/entities/host-group/rules/schema';

import { buildOperationTargetLinks } from '@/features/server-groups/shared/lib/operation-target-links';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

interface OperationTargetsTableProps {
  groupId: string;
  targets: HostGroupOperationTarget[];
}

function TargetLink(props: {
  href: string;
  label: string;
}) {
  return (
    <span className="truncate font-mono text-xs text-muted-foreground">
      {props.label}
    </span>
  );
}

export function OperationTargetsTable(props: OperationTargetsTableProps) {
  const { groupId, targets } = props;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Server</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Execution</TableHead>
          <TableHead>Deployment</TableHead>
          <TableHead>Agent Command</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target) => {
          const links = buildOperationTargetLinks({
            groupId,
            target,
          });

          return (
            <TableRow key={target.id}>
              <TableCell className="font-medium">
                <Link
                  className="text-primary hover:underline"
                  params={links.server.params}
                  to={links.server.to}
                >
                  {target.serverId}
                </Link>
              </TableCell>
              <TableCell>{target.status}</TableCell>
              <TableCell>
                {links.execution ? (
                  <Link
                    className="font-mono text-xs text-primary hover:underline"
                    params={links.execution.params}
                    to={links.execution.to}
                  >
                    {target.executionId}
                  </Link>
                ) : (
                  <TargetLink href="" label="-" />
                )}
              </TableCell>
              <TableCell>
                {links.deployment ? (
                  <Link
                    className="font-mono text-xs text-primary hover:underline"
                    params={links.deployment.params}
                    to={links.deployment.to}
                  >
                    {target.deploymentId}
                  </Link>
                ) : (
                  <TargetLink href="" label="-" />
                )}
              </TableCell>
              <TableCell>
                {links.agentCommand ? (
                  <Link
                    className="font-mono text-xs text-primary hover:underline"
                    params={links.agentCommand.params}
                    search={links.agentCommand.search}
                    to={links.agentCommand.to}
                  >
                    {target.agentCommandId}
                  </Link>
                ) : (
                  <TargetLink href="" label="-" />
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {target.error || '-'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
