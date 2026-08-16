export interface SelectMachineModalProps {
  confirmLabel?: string;
  description?: string;
  disabledMachineIds?: number[];
  initialSelectedMachineIds?: number[];
  onMachineSelected?: (machineID: number) => void;
  onMachinesSelected?: (machineIDs: number[]) => void | Promise<void>;
  selectionMode?: 'single' | 'multiple';
  title?: string;
}
