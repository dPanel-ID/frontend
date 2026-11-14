import { MoonIcon, SunIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useTheme } from '@/services/theme/model';

import { Button } from '@/shared/presentation/atoms/Button';

export default function ThemeToggler() {
  const [theme, { setTheme }] = useTheme();
  const t = useDevetekTranslations('sidebar.footer');
  // Names the action, not the "BETA" badge a screen reader would read.
  const label = theme === 'dark' ? t('switchToLight') : t('switchToDark');

  const handleClick = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      className="relative"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      {theme === 'dark' ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}

      <span
        aria-hidden
        className="absolute bottom-1.5 px-[1px] rounded-xs text-[6px] bg-red-500 text-white"
      >
        BETA
      </span>
    </Button>
  );
}
