export interface SelectMachineModalProps {
  allowEmptySelection?: boolean;
  confirmLabel?: string;
  description?: string;
  disabledMachineIds?: string[];
  /** Shown on disabled cards, for example "Already a member". */
  disabledReason?: string;
  initialSelectedMachineIds?: string[];
  onMachineSelected?: (machineID: string) => void;
  onMachinesSelected?: (machineIDs: string[]) => void | Promise<void>;
  selectionMode?: 'single' | 'multiple';
  title?: string;
}
