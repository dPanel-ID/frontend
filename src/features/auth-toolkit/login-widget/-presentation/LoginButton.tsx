import { useMemo, useState } from 'react';

import { LogInIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { iife } from '@/shared/libs/browser/fn';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import IconBrandGithub from '@/shared/presentation/icons/BrandGithub';
import IconBrandGoogle from '@/shared/presentation/icons/BrandGoogle';

export interface LoginButtonProps {
  className?: string;
  variant: 'traditional' | 'with-google' | 'with-github';
  onClick?: () => Promise<void | 'infinite'>;
}

export default function LoginButton(props: LoginButtonProps) {
  const { className, variant, onClick } = props;

  const [buttonState, setButtonState] = useState<'loading' | 'success'>();

  const t = useDevetekTranslations();

  const renderedContent = useMemo(() => {
    if (variant === 'with-google') {
      return (
        <>
          <IconBrandGoogle />
          Google
        </>
      );
    }

    if (variant === 'with-github') {
      return (
        <>
          <IconBrandGithub />
          GitHub
        </>
      );
    }

    return (
      <>
        <LogInIcon />
        {t('common.actions.login')}
      </>
    );
  }, [t, variant]);

  const label = iife(() => {
    if (variant === 'with-google') {
      return t('page.landing.asideLogin.continueWithGoogle');
    }
    if (variant === 'with-github') {
      return t('page.landing.asideLogin.continueWithGithub');
    }
    return undefined;
  });

  const handleClick = async () => {
    if (!onClick) return;

    try {
      setButtonState('loading');

      const result = await onClick();
      if (result === 'infinite') return;

      setButtonState('success');
    } catch {
      setButtonState(undefined);
    }
  };

  return (
    <Button.Action
      buttonStyle="3d"
      buttonColor={variant === 'traditional' ? 'primary' : 'secondary'}
      disabled={buttonState != null}
      buttonState={buttonState}
      className={cn('w-full', className)}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      {renderedContent}
    </Button.Action>
  );
}
