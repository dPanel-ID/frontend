import { useState } from 'react';

import { EyeIcon, EyeOffIcon, UserRoundIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';

import { useForm } from '../../-model';
import {
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
} from '../../-model/provider';
import { ErrorInline } from '../../-presentation/ErrorInline';
import { Sectioned } from '../../../-presentation/Sectioned';

export default function SectionLogin() {
  const { form, formErrors } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;
  const usesBiznetGio = isBiznetGioProvider(provider);
  const usesGcp = isGcpProvider(provider);
  const usesDigitalOcean = isDigitalOceanProvider(provider);

  return (
    <Sectioned
      withinCard
      sectionIcon={UserRoundIcon}
      sectionTitle="Access"
      sectionDescription="Set the initial VM login required by the provider VM creation contract."
    >
      <div className={usesGcp ? 'space-y-2' : 'grid gap-4 lg:grid-cols-2'}>
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">
            {usesBiznetGio ? 'SSH and Console User' : 'Default User'}
          </h6>
          <Input
            className="w-full bg-background"
            placeholder={usesBiznetGio ? 'dpanel1' : 'dpanel'}
            {...form.register('login.username')}
          />
          <ErrorInline message={formErrors.login?.username?.message} />
        </div>

        {!usesGcp && !usesDigitalOcean && (
          <div className="space-y-2">
            <h6 className="text-sm font-semibold">
              {usesBiznetGio ? 'Console Password' : 'Bootstrap Password'}
            </h6>
            <div className="flex items-center gap-2">
              <Input
                className="w-full bg-background"
                type={showPassword ? 'text' : 'password'}
                placeholder="Required"
                {...form.register('login.password')}
              />
              <Button
                asChild
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
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
              {usesBiznetGio
                ? 'Sent as vm.console_password and hidden from review.'
                : 'Sent as vm.password and hidden from review.'}
            </p>
            <ErrorInline message={formErrors.login?.password?.message} />
          </div>
        )}

        {(usesGcp || usesDigitalOcean) && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Sent as vm.username. The selected dPanel SSH key is injected into
            the provider VM request for setup.
          </p>
        )}
      </div>
    </Sectioned>
  );
}
