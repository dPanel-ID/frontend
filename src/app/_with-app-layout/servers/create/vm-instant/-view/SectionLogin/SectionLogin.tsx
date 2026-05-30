import { useState } from 'react';

import { EyeIcon, EyeOffIcon, UserRoundIcon } from 'lucide-react';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';

import { useForm } from '../../-model';
import { ErrorInline } from '../../-presentation/ErrorInline';
import { Sectioned } from '../../../-presentation/Sectioned';

export default function SectionLogin() {
  const { form, formErrors } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Sectioned
      withinCard
      sectionIcon={UserRoundIcon}
      sectionTitle="Access"
      sectionDescription="Set the initial VM login required by the provider VM creation contract."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">Default User</h6>
          <Input
            className="w-full bg-background"
            placeholder="dpanel"
            {...form.register('login.username')}
          />
          <ErrorInline message={formErrors.login?.username?.message} />
        </div>

        <div className="space-y-2">
          <h6 className="text-sm font-semibold">Bootstrap Password</h6>
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
            Sent as vm.password and hidden from review.
          </p>
          <ErrorInline message={formErrors.login?.password?.message} />
        </div>
      </div>
    </Sectioned>
  );
}
