import { MessageCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { useAssistantSidepanel } from '../../sidepanel';

/**
 * The floating "Ask dPanel" button, fixed at the bottom right of every page.
 * Sign-in and availability are handled inside the panel it opens.
 */
export default function AssistantLauncher() {
  const t = useDevetekTranslations();
  const [openSidepanel] = useAssistantSidepanel();

  const label = t('sidepanel.aiAssistant.launcher');

  return (
    <button
      type="button"
      onClick={() => openSidepanel({})}
      aria-label={label}
      title={label}
      className="fixed right-5 bottom-5 z-30 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-600"
    >
      <MessageCircleIcon className="size-5" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
