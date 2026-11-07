import { useState } from 'react';

import { LoaderCircleIcon, RotateCcwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import type { ReinstallServerPayload } from '../rules/types';

import { ConsequenceList } from './ConsequenceList';

interface ReinstallServerDialogProps {
  target: ReinstallServerPayload | null;
  isSubmitting: boolean;
  /** force reinstalls a private server's agent that is already current. */
  onConfirm: (force?: boolean) => void;
  onClose: () => void;
}

/**
 * Confirms a reinstall and says what the setup workflow will do. On a private
 * server setup reinstalls only the agent, so the dialog says that instead.
 */
export function ReinstallServerDialog(props: ReinstallServerDialogProps) {
  const { isSubmitting, onClose, onConfirm, target } = props;
  const t = useDevetekTranslations();
  const [force, setForce] = useState(false);

  const name = target?.serverName || String(target?.serverId ?? '');
  const copy = target?.isPrivate
    ? 'page.servers.dialogs.reinstallAgent'
    : 'page.servers.dialogs.reinstall';

  return (
    <Dialog
      open={target != null}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setForce(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
              <RotateCcwIcon className="size-5" />
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle>{t(`${copy}.title`)}</DialogTitle>
              <DialogDescription className="mt-1">
                {t.rich(`${copy}.description`, {
                  name,
                  strong: (chunks) => (
                    <strong className="text-primary">{chunks}</strong>
                  ),
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5">
          <ConsequenceList
            tone="info"
            numbered
            title={t(`${copy}.happens`)}
            items={[t(`${copy}.step1`), t(`${copy}.step2`), t(`${copy}.step3`)]}
          />
          {target?.isPrivate && (
            <label className="mt-4 flex items-start gap-2 text-sm text-primary/80">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={force}
                disabled={isSubmitting}
                onChange={(event) => setForce(event.target.checked)}
              />
              {t('page.servers.dialogs.reinstallAgent.force')}
            </label>
          )}
        </div>

        <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isSubmitting}
            onClick={onClose}
          >
            {t('common.actions.cancel')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky')}
            disabled={isSubmitting}
            onClick={() => {
              onConfirm(force);
              setForce(false);
            }}
          >
            {isSubmitting ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <RotateCcwIcon className="size-4" />
            )}
            {t(`${copy}.confirm`)}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
