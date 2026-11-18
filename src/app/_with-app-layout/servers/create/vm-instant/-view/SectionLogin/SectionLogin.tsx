import { useState } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';

import { useForm } from '../../-model';
import {
  isBiznetGioProvider,
  isDigitalOceanProvider,
} from '../../-model/provider';
import { useJoinMethod } from '../../-model/use-join-method';
import { ErrorInline } from '../../-presentation/ErrorInline';

/**
 * The Access step: the user the VM is created with and, where the provider
 * asks for one, its first password. Providers with a fixed login user (AWS,
 * GCP, Alibaba Cloud, Tencent Cloud) skip this step, see getFixedLoginUser.
 */
export default function SectionLogin() {
  const t = useDevetekTranslations('page.servers.create.vmInstant.login');
  const { form, formErrors } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    string | undefined;
  const joinMethod = useJoinMethod();
  const usesBiznetGio = isBiznetGioProvider(provider);
  // DigitalOcean takes a username only: the VM gets no password, and over
  // SSH the chosen key is how dPanel logs in.
  const usernameOnly = isDigitalOceanProvider(provider);

  return (
    <div className="space-y-5">
      <div className={usernameOnly ? 'space-y-2' : 'grid gap-4 lg:grid-cols-2'}>
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">
            {usesBiznetGio ? t('userTitleConsole') : t('userTitle')}
          </h6>
          <Input
            className="w-full bg-background"
            placeholder={usesBiznetGio ? 'dpanel1' : 'dpanel'}
            {...form.register('login.username')}
          />
          <ErrorInline message={formErrors.login?.username?.message} />
        </div>

        {!usernameOnly && (
          <div className="space-y-2">
            <h6 className="text-sm font-semibold">
              {usesBiznetGio ? t('passwordTitleConsole') : t('passwordTitle')}
            </h6>
            <div className="flex items-center gap-2">
              <Input
                className="w-full bg-background"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                {...form.register('login.password')}
              />
              <Button
                asChild
                aria-label={
                  showPassword ? t('hidePassword') : t('showPassword')
                }
                title={showPassword ? t('hidePassword') : t('showPassword')}
                buttonStyle="outline"
                buttonColor="secondary"
                size="icon"
              >
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {usesBiznetGio ? t('passwordHintConsole') : t('passwordHint')}
            </p>
            <ErrorInline message={formErrors.login?.password?.message} />
          </div>
        )}

        {usernameOnly && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {joinMethod === 'agent' ? t('userHintAgent') : t('userHintSsh')}
          </p>
        )}
      </div>
    </div>
  );
}
