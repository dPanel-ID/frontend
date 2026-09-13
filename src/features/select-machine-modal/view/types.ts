export interface SelectMachineModalProps {
  allowEmptySelection?: boolean;
  confirmLabel?: string;
  description?: string;
  disabledMachineIds?: string[];
  initialSelectedMachineIds?: string[];
  onMachineSelected?: (machineID: string) => void;
  onMachinesSelected?: (machineIDs: string[]) => void | Promise<void>;
  selectionMode?: 'single' | 'multiple';
  title?: string;
}
