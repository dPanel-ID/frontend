import { useState } from 'react';

import { CheckIcon, CopyIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import type { ServerLogEntrySidepanelProps as Props } from '../rules/types';

import LogEntryDetails from './LogEntryDetails';

/** One log line in full: message, structured payload, context and raw text. */
export default function ServerLogEntrySidepanel(props: Props) {
  const { entry, filePath } = props;
  const t = useDevetekTranslations('sidepanel.logEntry');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be refused; the raw line stays selectable below.
    }
  };

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[620px]">
      <Layout.Title
        title={t('title')}
        subtitle={[t('line', { number: entry.lineNumber }), filePath]
          .filter(Boolean)
          .join(' · ')}
        hasCloseButton
      />

      <Layout.Content className="pb-4">
        <LogEntryDetails entry={entry} />
      </Layout.Content>

      <Layout.Cta className="gap-y-2">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={handleCopy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? t('copied') : t('copy')}
        </Button>
      </Layout.Cta>
    </Layout>
  );
}
