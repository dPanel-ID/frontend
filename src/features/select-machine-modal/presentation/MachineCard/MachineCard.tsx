import { Button } from '@/shared/presentation/atoms/Button';
import { cn } from '@/shared/libs/tailwind/cn';

export default function MachineCard(props: Props) {
  const { disabled, machineName, machinePublicIP, onClickSelect, selected } =
    props;

  return (
    <Button
      className={cn(
        'h-auto cursor-pointer px-3 py-2 flex items-center justify-start text-start overflow-hidden',
        selected && 'border-primary bg-primary/10',
      )}
      disabled={disabled}
      onClick={onClickSelect}
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
  disabled?: boolean;
  machineName: string;
  machinePublicIP: string;
  onClickSelect?: () => void;
  selected?: boolean;
}
