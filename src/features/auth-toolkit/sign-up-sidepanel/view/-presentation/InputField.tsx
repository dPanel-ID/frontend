import { useState } from 'react';
import type { HTMLInputTypeAttribute } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { useController, useFormContext } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { camelCaseToCapitalizedSentence } from '@/shared/libs/browser/string';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import type { SignUpForm } from '../../rules/login';

export interface LoginFieldProps {
  formName: keyof SignUpForm;
  inputType: HTMLInputTypeAttribute;
}

export default function InputField(props: LoginFieldProps) {
  const { formName, inputType } = props;

  const t = useDevetekTranslations();

  const form = useFormContext<SignUpForm>();
  const [showPassword, setShowPassword] = useState(false);

  const { fieldState } = useController({
    name: formName,
    control: form.control,
  });

  const renderErrorMessage = () => {
    if (fieldState.error?.message) {
      return t(fieldState.error.message);
    }
  };

  const isPasswordInput = inputType === 'password';
  const resolvedInputType =
    isPasswordInput && showPassword ? 'text' : inputType || 'text';
  const toggleLabel =
    formName === 'confirmPassword'
      ? showPassword
        ? t('sidepanel.signUp.hideConfirmPassword')
        : t('sidepanel.signUp.showConfirmPassword')
      : showPassword
        ? t('sidepanel.signUp.hidePassword')
        : t('sidepanel.signUp.showPassword');

  return (
    <div className="w-full">
      <p className="mb-0.5 text-sm font-medium text-primary/70">
        {camelCaseToCapitalizedSentence(String(formName))}
        <span className="font-medium text-red-500">*</span>
      </p>

      <div className="relative">
        <Input
          {...form.register(formName)}
          type={resolvedInputType}
          className={isPasswordInput ? 'w-full pr-10' : 'w-full'}
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
    </div>
  );
}
