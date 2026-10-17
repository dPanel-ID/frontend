import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

export interface ServerLogEntrySidepanelProps {
  entry: ParsedLogLine;
  /** The file the line came from, shown under the title. */
  filePath?: string;
}
