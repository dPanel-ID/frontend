export interface ExecutionErrorDetailV1 {
  action?: string;
  command?: string;
  detail?: string;
  event_type?: string;
  execution_id?: string;
  exit_code?: number | null;
  host?: string;
  machine_id?: string;
  message?: string;
  module?: string;
  module_id?: string;
  organization_id?: string;
  play?: string;
  playbook?: string;
  role?: string;
  stderr?: string;
  stdout?: string;
  summary?: string;
  task?: string;
  task_path?: string;
  traceparent?: string;
  type?: string;
}
