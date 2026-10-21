import { useState } from 'react';

import Cookies from 'js-cookie';

import { isSSR } from '@/shared/libs/browser/environment';
import { buildContext } from '@/shared/libs/react-factories/buildContext';
import useHandler from '@/shared/libs/react-hooks/useHandler';
import { useIsomorphicEffect } from '@/shared/libs/react-hooks/useIsomorphicEffect';

import type { Theme } from '../config';
import { SUPPORTED_THEME, THEME_COOKIE } from '../config';

export const [DevetekThemeModel, useDevetekThemeModel] = buildContext(
  'DevetekThemeModel',
  () => {
    const [userTheme, setUserThemeInternal] = useState((): Theme | null => {
      try {
        const storedTheme: string | undefined = Cookies.get()[THEME_COOKIE];

        if (!storedTheme) {
          throw Error('No user defined theme set yet');
        }

        if (!SUPPORTED_THEME.includes(storedTheme as Theme)) {
          throw Error('Unknown saved theme');
        }

        return storedTheme as Theme;
      } catch {
        return null;
      }
    });

    // Resolved after mount rather than during render. The server has no
    // media query to read, so rendering the real preference straight away
    // would disagree with the server's markup, and React keeps the server's
    // version through hydration: anyone whose system is dark would be shown
    // a control labelled and iconed for the theme they are not in. Starting
    // at the SSR value and correcting it in a layout effect keeps the two
    // in step, and following the query afterwards means the page tracks the
    // system while no explicit choice is saved.
    const [systemTheme, setSystemTheme] = useState<Theme>('light');

    useIsomorphicEffect(() => {
      if (isSSR()) return;

      const query = window.matchMedia('(prefers-color-scheme: dark)');
      const sync = () => setSystemTheme(query.matches ? 'dark' : 'light');

      sync();
      query.addEventListener('change', sync);

      return () => query.removeEventListener('change', sync);
    }, []);

    useIsomorphicEffect(() => {
      const root = window.document.documentElement;

      root.classList.remove(...SUPPORTED_THEME);

      if (!userTheme) {
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(userTheme);
    }, [systemTheme, userTheme]);

    // No router invalidation: the theme is a class on the document element,
    // applied by the effect above, and the cookie is only there so the next
    // document starts in the right theme. Re-running the route loaders would
    // fetch the same markup back to change nothing.
    const setUserTheme = useHandler((newTheme?: Theme | null) => {
      if (!newTheme) {
        Cookies.remove(THEME_COOKIE);
      } else {
        Cookies.set(THEME_COOKIE, newTheme, { expires: 365 });
      }

      setUserThemeInternal(newTheme || null);
    });

    return {
      isSystem: !userTheme,
      systemTheme,
      userTheme,
      setUserTheme,
    };
  },
);

export function useTheme() {
  const { isSystem, setUserTheme, systemTheme, userTheme } =
    useDevetekThemeModel();

  return [
    userTheme || systemTheme,
    { setTheme: setUserTheme, isSystem },
  ] as const;
}
