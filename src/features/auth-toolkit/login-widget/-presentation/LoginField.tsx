import { useState } from 'react';
import type { HTMLInputTypeAttribute, ReactNode } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useController } from 'react-hook-form';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { capitalizeFirstLetter } from '@/shared/libs/browser/string';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

type FormKey<F> = Path<F> & HTMLInputTypeAttribute;

export interface LoginFieldProps<F extends FieldValues, K extends FormKey<F>> {
  form: UseFormReturn<F>;
  formName: K;
  appendSlot?: ReactNode;
}

export default function LoginField<F extends FieldValues, K extends FormKey<F>>(
  props: LoginFieldProps<F, K>,
) {
  const { form, formName, appendSlot } = props;
  const [showPassword, setShowPassword] = useState(false);

  const t = useDevetekTranslations();

  const { fieldState } = useController({
    name: formName,
    control: form.control,
  });

  const renderErrorMessage = () => {
    if (fieldState.error?.message) {
      return t(fieldState.error.message);
    }
  };

  const isPasswordInput = formName === 'password';
  const resolvedInputType =
    isPasswordInput && showPassword ? 'text' : isPasswordInput ? 'password' : 'text';
  const toggleLabel = showPassword
    ? t('sidepanel.signUp.hidePassword')
    : t('sidepanel.signUp.showPassword');

  return (
    <div className="w-full">
      <p className="pl-1 text-sm font-medium text-primary/70">
        {capitalizeFirstLetter(String(formName))}
        <span className="font-medium text-red-500">*</span>
      </p>

      <div className="relative">
        <Input
          {...form.register(formName)}
          type={resolvedInputType}
          className={isPasswordInput ? 'w-full pr-10' : 'w-full'}
          variant="3d"
        />

        {isPasswordInput && (
          <Button
            asChild
            size="icon-sm"
            buttonStyle="ghost"
            buttonColor="secondary"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((value) => !value)}
          >
            <button type="button" aria-label={toggleLabel} title={toggleLabel}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </Button>
        )}
      </div>

      <ErrorInline message={renderErrorMessage()} />

      {appendSlot && <div className="mt-1">{appendSlot}</div>}
    </div>
  );
}

export interface ForgotPasswordCtaProps {
  onClick?: () => void;
}

LoginField.ForgotPasswordCta = function ForgotPasswordCta(
  props: ForgotPasswordCtaProps,
) {
  const { onClick } = props;

  const t = useDevetekTranslations();

  return (
    <p
      className="text-right text-xs font-medium text-primary/70"
      onClick={onClick}
    >
      <a className="w-max hover:underline cursor-pointer">
        {t('page.landing.asideLogin.forgotPasswordQM')}
      </a>
    </p>
  );
};
