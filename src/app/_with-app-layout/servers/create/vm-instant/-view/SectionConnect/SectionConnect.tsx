import {
  InfoIcon,
  KeyRoundIcon,
  PlugZapIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Switch } from '@/shared/presentation/atoms/Switch';
import { ChoiceTile } from '@/shared/presentation/molecules/ChoiceTile';
import { SshKeyPicker } from '@/shared/presentation/organisms/SshKeyPicker';

import { useForm } from '../../-model';
import { resolveJoinMethod } from '../../-model/join';
import type { JoinMethod } from '../../-model/join';
import { isAwsProvider, usesManagedNetwork } from '../../-model/provider';
import { ErrorInline } from '../../-presentation/ErrorInline';

const JOIN_ICONS: Record<JoinMethod, LucideIcon> = {
  agent: PlugZapIcon,
  ssh: KeyRoundIcon,
};

/**
 * "How dPanel connects": the dPanel agent (recommended, no dPanel key on the
 * VM) or SSH, the public IP switch, and the SSH key picker for SSH only. The
 * choices come from the provider's VM create contract.
 */
export default function SectionConnect() {
  const t = useDevetekTranslations('page.servers.create.vmInstant');
  const { form } = useForm();
  const [provider, contract, joinMethodValue, reservePublicIP, vpcID] =
    useWatch({
      control: form.control,
      name: [
        'provider',
        'contract',
        'joinMethod',
        'spec.reservePublicIP',
        'vpcBulk.id',
      ],
    });

  const values = {
    joinMethod: joinMethodValue,
    contract,
    spec: { reservePublicIP },
  };
  const joinMethod = resolveJoinMethod(values);
  const publicIPOff = contract.publicIPChoice && !reservePublicIP;

  const selectJoinMethod = (method: JoinMethod) => {
    form.setValue('joinMethod', method, { shouldValidate: true });
  };

  const setPublicIP = (checked: boolean) => {
    form.setValue('spec.reservePublicIP', checked, { shouldValidate: true });
    // SSH reaches the VM on its public IP; without one only the agent works.
    if (!checked)
      form.setValue('joinMethod', 'agent', { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h6 className="text-sm font-semibold">{t('join.title')}</h6>
        {contract.agentJoin ? (
          <>
            <div
              role="radiogroup"
              aria-label={t('join.ariaLabel')}
              className="grid gap-2 sm:grid-cols-2"
            >
              {(['agent', 'ssh'] as const).map((method) => {
                const Icon = JOIN_ICONS[method];
                return (
                  <div key={method} className="flex min-w-0 flex-col gap-1.5">
                    <ChoiceTile
                      selected={joinMethod === method}
                      onSelect={() => selectJoinMethod(method)}
                      disabled={method === 'ssh' && publicIPOff}
                      badge={
                        method === 'agent' ? t('join.recommended') : undefined
                      }
                      leading={
                        <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                          <Icon className="size-4" />
                        </span>
                      }
                      title={t(`join.${method}.title`)}
                      subtitle={t(`join.${method}.subtitle`)}
                    />
                    <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                      {t(`join.${method}.tradeoff`)}
                    </p>
                  </div>
                );
              })}
            </div>
            <Note>{t(`join.${joinMethod}.detail`)}</Note>
            {publicIPOff && <Note>{t('join.agentOnly')}</Note>}
          </>
        ) : (
          <Note>{t('join.sshOnly')}</Note>
        )}
      </div>

      {contract.publicIPChoice && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">{t('publicIP.title')}</h6>
          <label className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {t('publicIP.label')}
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                {!contract.agentJoin
                  ? t('publicIP.sshNeedsIP')
                  : reservePublicIP
                    ? t('publicIP.on')
                    : t('publicIP.off')}
              </span>
            </span>
            <Switch
              checked={reservePublicIP}
              disabled={!contract.agentJoin}
              onCheckedChange={setPublicIP}
              aria-label={t('publicIP.label')}
            />
          </label>
          {publicIPOff &&
            (usesManagedNetwork(provider) ? (
              <Note>
                {isAwsProvider(provider)
                  ? t('publicIP.offAws')
                  : t('publicIP.offManaged')}
              </Note>
            ) : vpcID ? (
              <Note tone="warning">{t('publicIP.offOwnNetwork')}</Note>
            ) : null)}
        </div>
      )}

      {joinMethod === 'ssh' && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">{t('sshKey.title')}</h6>
          <SshKeyField />
        </div>
      )}
    </div>
  );
}

function SshKeyField() {
  const { form, formErrors, setLabel } = useForm();
  const control = useController({
    control: form.control,
    name: 'cloud.sshKeyID',
  });

  return (
    <div className="space-y-2">
      <SshKeyPicker
        selectedID={control.field.value}
        onSelect={(sshKey) => {
          setLabel('sshKey', sshKey.name || `SSH key ${sshKey.id}`);
          control.field.onChange(String(sshKey.id));
        }}
      />
      <ErrorInline message={formErrors.cloud?.sshKeyID?.message} />
    </div>
  );
}

function Note(props: { children: string; tone?: 'info' | 'warning' }) {
  const { children, tone = 'info' } = props;
  const Icon = tone === 'warning' ? TriangleAlertIcon : InfoIcon;

  return (
    <p
      role={tone === 'warning' ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-2 rounded-lg border bg-background p-3 text-xs leading-relaxed text-muted-foreground',
        tone === 'warning' &&
          'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
