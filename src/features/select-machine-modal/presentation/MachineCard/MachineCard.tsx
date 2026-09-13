import { Button } from '@/shared/presentation/atoms/Button';
import { cn } from '@/shared/libs/tailwind/cn';

export default function MachineCard(props: Props) {
  const {
    checked,
    disabled,
    machineName,
    machinePublicIP,
    onClickSelect,
    selectionRole,
    selected,
  } = props;

  return (
    <Button
      aria-checked={checked}
      className={cn(
        'h-auto cursor-pointer px-3 py-2 flex items-center justify-start text-start overflow-hidden',
        selected && 'border-primary bg-primary/10',
      )}
      data-state={checked ? 'selected' : 'idle'}
      disabled={disabled}
      onClick={onClickSelect}
      role={selectionRole}
      variant="outline"
    >
      <div className="flex flex-col">
        <p className="text-md font-bold whitespace-break-spaces">
          {machineName}
        </p>
        <p className="text-sm">{machinePublicIP}</p>
      </div>
    </Button>
  );
}

interface Props {
  checked?: boolean;
  disabled?: boolean;
  machineName: string;
  machinePublicIP: string;
  onClickSelect?: () => void;
  selected?: boolean;
  selectionRole?: 'checkbox' | 'radio';
}
