import type { ServerMinimal } from '@/entities/server/rules/schema';

export interface LogBrowserModalProps {
  appName: string;
  userName: string;
  machineID: number;
  deploymentTargets?: ServerMinimal[];

  onClickLogFile?: (logFilename: string, machineID: number) => void;
}
