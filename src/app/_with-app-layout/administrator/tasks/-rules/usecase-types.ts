/** What a confirm dialog needs to describe the task it acts on. */
export interface AdminTaskActionPayload {
  executionId: string;
  type: string | null;
  serverHostname: string | null;
  workerId: string | null;
}
