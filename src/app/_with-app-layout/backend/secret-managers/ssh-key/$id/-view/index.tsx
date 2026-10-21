import { useState } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  GlobeIcon,
  KeyRoundIcon,
  LockIcon,
  RulerIcon,
  ServerIcon,
  Trash2Icon,
} from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiSecret } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

interface SshKeyDetailViewProps {
  sshKey: DTOs.SshKeyV1;
}

/**
 * What one key is, what it can be used for, and the one destructive action,
 * in that order. The private half is described, never rendered.
 */
export default function SshKeyDetailView(props: SshKeyDetailViewProps) {
  const { sshKey } = props;
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [openDialog] = useDialog();

  const id = sshKey.id ?? 0;
  const name = sshKey.name ?? t('page.sshKeys.detail.fallbackName');
  const publicKey = sshKey.data?.public ?? '';
  const length = sshKey.data?.length ?? '';
  const type = sshKey.type ?? '';

  const handleDelete = () => {
    openDialog({
      title: t('page.sshKeys.deleteDialog.title'),
      content: t('page.sshKeys.detail.deleteDialog.message', { name }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const response = await ApiSecret.SshKey.Delete.$Id.doDelete({
            id: String(id),
          });

          if (response.$status === 'success') {
            openToaster({
              variant: 'success',
              message: t('page.sshKeys.toaster.deleteSuccess', { name }),
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
            title: t('page.sshKeys.toaster.deleteError', { name }),
            message: response.error.message,
          });
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatTile
          icon={KeyRoundIcon}
          tone="sky"
          label={t('page.sshKeys.detail.type')}
          value={type || '—'}
        />
        <StatTile
          icon={RulerIcon}
          tone="neutral"
          label={t('page.sshKeys.detail.bitLength')}
          value={length || '—'}
        />
        <StatTile
          icon={CalendarIcon}
          tone="neutral"
          label={t('common.terms.createdAt')}
          value={formatDate(sshKey.created_at)}
        />
        <StatTile
          icon={CalendarIcon}
          tone="neutral"
          label={t('common.terms.lastUpdated')}
          value={formatDate(sshKey.updated_at)}
        />
      </section>

      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            FLOW_ACCENTS.sky.glow,
          )}
        />
        <div className="relative flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-bold">
              {t('page.sshKeys.detail.whatNowTitle')}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('page.sshKeys.detail.whatNow')}
            </p>
          </div>
          <Link
            to="/servers/create"
            className={cn(flowCtaClassName('sky'), 'shrink-0')}
          >
            <ServerIcon className="size-4" />
            {t('page.sshKeys.detail.useOnServer')}
            <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <GlobeIcon className="size-4 text-muted-foreground" aria-hidden />
            {t('page.sshKeys.detail.publicKey')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t('page.sshKeys.detail.safeToShare')}
            </span>
            <CopyPublicKeyButton publicKey={publicKey} />
          </div>
        </header>
        <div className="bg-background/60 p-4">
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-primary/80">
            {publicKey || (
              <em className="opacity-40">
                {t('page.sshKeys.detail.noPublicKeyData')}
              </em>
            )}
          </pre>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-amber-500/30 bg-card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <LockIcon className="size-4 text-amber-500" aria-hidden />
            {t('page.sshKeys.detail.privateKey')}
          </h2>
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
            {t('page.sshKeys.detail.notDisplayed')}
          </span>
        </header>
        <div className="flex flex-col gap-3 p-4">
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t('page.sshKeys.detail.privateKeyStored')}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('page.sshKeys.detail.privateKeyNotDisplayed')}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-red-500/30 bg-card">
        <header className="border-b border-red-500/20 bg-red-500/5 px-4 py-3">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
            {t('page.sshKeys.detail.dangerZone')}
          </h2>
        </header>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {t('page.sshKeys.detail.deleteThisKey')}
            </p>
            <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
              {t('page.sshKeys.detail.deleteThisKeyDescription')}
            </p>
          </div>
          <Button
            danger
            buttonColor="primary"
            size="sm"
            className="shrink-0"
            onClick={handleDelete}
          >
            <Trash2Icon />
            {t('page.sshKeys.detail.deleteKey')}
          </Button>
        </div>
      </section>
    </div>
  );
}

function CopyPublicKeyButton(props: { publicKey: string }) {
  const { publicKey } = props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      openToaster({
        variant: 'error',
        message: t('page.sshKeys.toaster.copyFailed'),
      });
    }
  };

  return (
    <Button
      size="sm"
      buttonStyle="outline"
      buttonColor="secondary"
      disabled={!publicKey}
      onClick={handleCopy}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {copied
        ? t('page.sshKeys.detail.copied')
        : t('page.sshKeys.detail.copyPublicKey')}
    </Button>
  );
}

function formatDate(value?: string) {
  if (!value) return '—';
  return dayjs(value).format('YYYY-MM-DD');
}
