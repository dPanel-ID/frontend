import { useMemo } from 'react';

import {
  CheckIcon,
  FolderPlusIcon,
  MessageCircleQuestionIcon,
  TrashIcon,
  TriangleAlertIcon,
  UploadIcon,
} from 'lucide-react';

import { useDevetekLocale } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { iife } from '@/shared/libs/browser/fn';
import { capitalizeFirstLetter } from '@/shared/libs/browser/string';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import type { OperationRowProps } from './types';

// function OpIcon(props: OpIconProps) {
//   const { operationKind } = props;
// }

export function OperationEmptyState() {
  return (
    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
      No operations yet.
    </div>
  );
}

export function OperationRow(props: OperationRowProps) {
  const locale = useDevetekLocale();

  const { operationReport } = props;
  const { id, timestamp, ...report } = operationReport;

  const OpIcon = useMemo(() => {
    switch (report.operationKind) {
      case 'upload':
        return UploadIcon;

      case 'folder_new':
        return FolderPlusIcon;

      case 'delete':
        return TrashIcon;

      default:
        return MessageCircleQuestionIcon;
    }
  }, [report.operationKind]);

  const StatusIcon = useMemo(() => {
    switch (report.status) {
      case 'done':
        return CheckIcon;

      case 'loading':
        return Spinner;

      case 'failed':
        return TriangleAlertIcon;

      default:
        return null;
    }
  }, [report.status]);

  const [kind, label] = iife(() => {
    switch (report.operationKind) {
      case 'upload':
        return ['File Upload', report.fileName];

      case 'folder_new':
        return ['New Folder', report.folderName];

      case 'delete': {
        const deleteKind = capitalizeFirstLetter(report.fsKind);

        return [`${deleteKind} Deletion`, report.itemName];
      }
    }
  });

  return (
    <div
      key={id}
      className="flex items-center gap-2.5 overflow-hidden rounded-lg border bg-background px-3 py-2"
    >
      <div className="relative shrink-0">
        <OpIcon className="relative shrink-0 size-6" />

        {StatusIcon && (
          <div className="absolute -bottom-1 -right-1 size-3.75 rounded-full bg-primary p-0.5 text-white dark:text-secondary">
            <StatusIcon className="h-full w-full" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden">
        <p className="overflow-hidden text-ellipsis text-xs text-muted-foreground">
          {kind} • {getDistanceFromNow(timestamp, locale)}
        </p>
        <p className="overflow-hidden text-ellipsis text-sm font-semibold text-primary">
          {label}
        </p>
      </div>
    </div>
  );
}
