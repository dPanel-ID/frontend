import {
  buildFrontendReturnUrl,
  buildGithubAuthUrl,
} from '@/shared/libs/browser/oauth';
import useHandler from '@/shared/libs/react-hooks/useHandler';

export default function useGithubLoginUsecase() {
  const handleUsecase = useHandler(() => {
    localStorage.setItem('auth:provider', 'github');
    window.location.href = buildGithubAuthUrl(
      buildFrontendReturnUrl('/applications'),
    );
  });

  return [handleUsecase] as const;
}
