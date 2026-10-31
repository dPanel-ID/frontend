import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

export default function SubmitButton(props: Props) {
  const { className, classNameWrapper, isSubmitting, label, onClick } = props;

  return (
    <section className={classNameWrapper}>
      <Button.Action
        className={cn('w-full', className)}
        buttonState={isSubmitting ? 'loading' : 'initial'}
        onClick={onClick}
      >
        {label ?? 'Connect cloud account'}
      </Button.Action>
    </section>
  );
}

interface Props {
  className?: string;
  classNameWrapper?: string;
  isSubmitting?: boolean;
  label?: string;
  onClick?: () => void;
}
