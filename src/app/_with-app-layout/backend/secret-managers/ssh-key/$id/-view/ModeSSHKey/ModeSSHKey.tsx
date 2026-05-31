import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  GlobeIcon,
  KeyRoundIcon,
  LockIcon,
  RulerIcon,
  Trash2Icon,
} from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { DTOs } from '@/shared/api';
import { ApiSecret } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';

interface ModeSSHKeyProps {
  sshkey: DTOs.SshKeyV1;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const t = useDevetekTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text manually
    }
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleCopy}>
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5 mr-1.5 text-green-500" />
      ) : (
        <ClipboardIcon className="w-3.5 h-3.5 mr-1.5" />
      )}
      {copied
        ? t('page.sshKeys.detail.copied')
        : (label ?? t('page.sshKeys.detail.copy'))}
    </Button>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof KeyRoundIcon;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-primary/50 flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <p className="text-sm font-medium break-all">{value ?? '—'}</p>
    </div>
  );
}

export default function ModeSshKey({ sshkey }: ModeSSHKeyProps) {
  const t = useDevetekTranslations();

  const sshKeyID = sshkey.id ?? 0;
  const sshKeyName = sshkey.name ?? '';
  const sshPubKey = sshkey.data?.public ?? '';
  const keyLength = sshkey.data?.length ?? '';
  const keyType = sshkey.type ?? '';
  const createdAt = sshkey.created_at
    ? dayjs(sshkey.created_at).format('YYYY-MM-DD HH:mm:ss')
    : null;
  const updatedAt = sshkey.updated_at
    ? dayjs(sshkey.updated_at).format('YYYY-MM-DD HH:mm:ss')
    : null;

  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [openDialog] = useDialog();

  const handleDelete = () => {
    openDialog({
      title: t('page.sshKeys.deleteDialog.title'),
      content: t('page.sshKeys.detail.deleteDialog.message', {
        name: sshKeyName,
      }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const res = await ApiSecret.SshKey.Delete.$Id.doDelete({
            id: String(sshKeyID),
          });

          if (res.$status === 'success') {
            openToaster({
              variant: 'success',
              message: t('page.sshKeys.toaster.deleteSuccess', {
                name: sshKeyName,
              }),
            });
            navigate({
              to: '/backend/secret-managers/ssh-key',
              search: { page: 1 },
              replace: true,
            });
            return;
          }

          openToaster({
            variant: 'error',
            title: t('page.sshKeys.toaster.deleteError', {
              name: sshKeyName,
            }),
            message: res.error.message,
          });
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Metadata */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-3">
          {t('page.sshKeys.detail.keyInformation')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetaItem
            icon={KeyRoundIcon}
            label={t('page.sshKeys.detail.name')}
            value={sshKeyName}
          />
          <MetaItem
            icon={KeyRoundIcon}
            label={t('page.sshKeys.detail.type')}
            value={keyType}
          />
          <MetaItem
            icon={RulerIcon}
            label={t('page.sshKeys.detail.bitLength')}
            value={keyLength}
          />
          <MetaItem
            icon={CalendarIcon}
            label={t('common.terms.createdAt')}
            value={createdAt}
          />
          <MetaItem
            icon={CalendarIcon}
            label={t('common.terms.lastUpdated')}
            value={updatedAt}
          />
        </div>
      </Card>

      {/* Public Key */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <GlobeIcon className="w-4 h-4 text-primary/60" />
            {t('page.sshKeys.detail.publicKey')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary/50">
              {t('page.sshKeys.detail.safeToShare')}
            </span>
            <CopyButton
              text={sshPubKey}
              label={t('page.sshKeys.detail.copyPublicKey')}
            />
          </div>
        </div>
        <div className="p-4 bg-muted/30">
          <pre className="font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-primary/80 max-h-48 overflow-y-auto">
            {sshPubKey || (
              <em className="opacity-40">
                {t('page.sshKeys.detail.noPublicKeyData')}
              </em>
            )}
          </pre>
        </div>
      </Card>

      {/* Private Key */}
      <Card className="overflow-hidden border-amber-500/20">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <LockIcon className="w-4 h-4 text-amber-500" />
            {t('page.sshKeys.detail.privateKey')}
          </p>
          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
            {t('page.sshKeys.detail.notDisplayed')}
          </span>
        </div>

        <div className="p-4 bg-muted/20">
          <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 leading-relaxed">
              {t('page.sshKeys.detail.privateKeyStored')}
            </p>
          </div>

          <p className="text-sm text-primary/60 leading-relaxed">
            {t('page.sshKeys.detail.privateKeyNotDisplayed')}
          </p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-red-500/20 bg-red-500/5">
          <p className="text-sm font-semibold text-red-500">
            {t('page.sshKeys.detail.dangerZone')}
          </p>
        </div>
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">
              {t('page.sshKeys.detail.deleteThisKey')}
            </p>
            <p className="text-xs text-primary/50">
              {t('page.sshKeys.detail.deleteThisKeyDescription')}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={handleDelete}
          >
            <Trash2Icon className="w-4 h-4 mr-1.5" />
            {t('page.sshKeys.detail.deleteKey')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
