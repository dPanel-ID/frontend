import { useState } from 'react';

import { EyeIcon, EyeOffIcon, LockKeyholeIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import { useDcContext } from '../../model';

export default function PasswordFields() {
  const { form } = useDcContext();
  const t = useDevetekTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordErrorId = 'profile-password-error';
  const confirmPasswordErrorId = 'profile-confirm-password-error';
  const passwordError = form.formState.errors.password?.message;
  const confirmPasswordError = form.formState.errors.confirmPassword?.message;

  return (
    <section className="rounded-md border bg-background p-3">
      <div className="flex items-start gap-3">
        <LockKeyholeIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {t('sidepanel.userEdit.passwordSectionTitle')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('sidepanel.userEdit.passwordSectionDescription')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {t('sidepanel.userEdit.newPassword')}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="pr-10"
              placeholder={t('sidepanel.userEdit.newPasswordPlaceholder')}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? passwordErrorId : undefined}
              {...form.register('password')}
            />
            <Button
              asChild
              size="icon-sm"
              buttonStyle="ghost"
              buttonColor="secondary"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword((value) => !value)}
            >
              <button
                type="button"
                aria-label={t(
                  showPassword
                    ? 'sidepanel.userEdit.hidePassword'
                    : 'sidepanel.userEdit.showPassword',
                )}
                title={t(
                  showPassword
                    ? 'sidepanel.userEdit.hidePassword'
                    : 'sidepanel.userEdit.showPassword',
                )}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </Button>
          </div>
          <ErrorInline id={passwordErrorId} message={passwordError} t={t} />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            {t('sidepanel.userEdit.confirmPassword')}
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="pr-10"
              placeholder={t('sidepanel.userEdit.confirmPasswordPlaceholder')}
              aria-invalid={Boolean(confirmPasswordError)}
              aria-describedby={
                confirmPasswordError ? confirmPasswordErrorId : undefined
              }
              {...form.register('confirmPassword')}
            />
            <Button
              asChild
              size="icon-sm"
              buttonStyle="ghost"
              buttonColor="secondary"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword((value) => !value)}
            >
              <button
                type="button"
                aria-label={t(
                  showConfirmPassword
                    ? 'sidepanel.userEdit.hideConfirmPassword'
                    : 'sidepanel.userEdit.showConfirmPassword',
                )}
                title={t(
                  showConfirmPassword
                    ? 'sidepanel.userEdit.hideConfirmPassword'
                    : 'sidepanel.userEdit.showConfirmPassword',
                )}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </Button>
          </div>
          <ErrorInline
            id={confirmPasswordErrorId}
            message={confirmPasswordError}
            t={t}
          />
        </div>
      </div>
    </section>
  );
}
