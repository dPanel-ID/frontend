import { useState } from 'react';

import { FolderTreeIcon, LoaderCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
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
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (groupId: string) => void;
}

/** Name and description only; servers are added on the group's page. */
export function CreateGroupDialog(props: CreateGroupDialogProps) {
  const { onCreated, onOpenChange, open } = props;
  const t = useDevetekTranslations('page.serverGroups.createDialog');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setError('');
    setIsSubmitting(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await ApiHostGroup.Create.doPost({
      name: name.trim(),
      description: description.trim() || undefined,
      server_ids: [],
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    const createdId = response.id;
    onOpenChange(false);
    reset();
    if (createdId) onCreated(String(createdId));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return;
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
              <FolderTreeIcon className="size-5" />
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle>{t('title')}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 p-5">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-primary/80">
              {t('name')}
              <span className="font-bold text-red-500">*</span>
            </span>
            <Input
              autoFocus
              value={name}
              placeholder={t('namePlaceholder')}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleCreate();
              }}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-primary/80">
              {t('descriptionLabel')}
            </span>
            <TextArea
              value={description}
              placeholder={t('descriptionPlaceholder')}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky')}
            disabled={isSubmitting || !name.trim()}
            onClick={handleCreate}
          >
            {isSubmitting ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <FolderTreeIcon className="size-4" />
            )}
            {isSubmitting ? t('creating') : t('create')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
