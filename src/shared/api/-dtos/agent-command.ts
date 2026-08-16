export interface AgentCommandV2 {
  id?: string;
  execution_id?: string;
  machine_id?: string;
  topic?: string;
  command_type?: string;
  status?: string;
  requested_by?: string;
  expires_at?: string;
  started_at?: string;
  finished_at?: string;
  error?: string;
  created_at?: string;
  updated_at?: string;
}
