export interface ItemStatusLogModalProps {
  logTopicTitle: string;
  logTopicMessage: string;

  /** Plain text; each line becomes a row in the log table. */
  mainLogs: string;
  additionalLogs?: string;
}
