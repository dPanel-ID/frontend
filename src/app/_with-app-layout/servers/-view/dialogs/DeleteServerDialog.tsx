import { useState } from 'react';

import { LoaderCircleIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { Input } from '@/shared/presentation/atoms/Input';
import { getCloudProviderLabel } from '@/shared/presentation/molecules/CloudProviderLogo';

import type { MachineDeletePayload } from '../../-usecase/types';

import { ConsequenceList } from './ConsequenceList';

interface DeleteServerDialogProps {
  target: MachineDeletePayload | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Deleting a server is the one action here that cannot be undone, so the
 * dialog spells out what goes away and asks for the name to be typed back.
 */
export function DeleteServerDialog(props: DeleteServerDialogProps) {
  const { isDeleting, onClose, onConfirm, target } = props;

  return (
    <Dialog
      open={target != null}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
    >
      {target && (
        <DeleteServerDialogBody
          key={target.serverId}
          target={target}
          isDeleting={isDeleting}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function DeleteServerDialogBody(
  props: DeleteServerDialogProps & { target: MachineDeletePayload },
) {
  const { isDeleting, onClose, onConfirm, target } = props;
  const t = useDevetekTranslations();
  const [typed, setTyped] = useState('');

  const expected =
    target.serverName || target.serverAddress || String(target.serverId);
  const providerLabel = target.provider
    ? (getCloudProviderLabel(target.provider) ?? target.provider)
    : undefined;
  const matches = typed.trim() === expected;

  return (
    <DialogContent className="max-w-lg gap-0 p-0">
      <DialogHeader className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300">
            <Trash2Icon className="size-5" />
          </span>
          <div className="min-w-0 text-left">
            <DialogTitle>{t('page.servers.dialogs.delete.title')}</DialogTitle>
            <DialogDescription className="mt-1">
              {t.rich('page.servers.dialogs.delete.description', {
                name: expected,
                strong: (chunks) => (
                  <strong className="text-primary">{chunks}</strong>
                ),
              })}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-4 p-5">
        <ConsequenceList
          tone="danger"
          title={t('page.servers.dialogs.delete.happens')}
          items={[
            t('page.servers.dialogs.delete.uninstallAgent'),
            providerLabel
              ? t('page.servers.dialogs.delete.cloudDeleted', {
                  provider: providerLabel,
                })
              : t('page.servers.dialogs.delete.ownKept'),
            t('page.servers.dialogs.delete.blocked'),
          ]}
        />

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">
            {t.rich('page.servers.dialogs.delete.confirmLabel', {
              name: expected,
              code: (chunks) => (
                <code className="rounded bg-border/50 px-1 py-0.5 font-mono text-xs">
                  {chunks}
                </code>
              ),
            })}
          </span>
          <Input
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={typed}
            disabled={isDeleting}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches && !isDeleting) onConfirm();
            }}
            className={cn(matches && 'border-red-400/60')}
          />
        </label>
      </div>

      <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          disabled={isDeleting}
          onClick={onClose}
        >
          {t('common.actions.cancel')}
        </Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          disabled={!matches || isDeleting}
          onClick={onConfirm}
        >
          {isDeleting ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <Trash2Icon />
          )}
          {t('page.servers.dialogs.delete.confirm')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
