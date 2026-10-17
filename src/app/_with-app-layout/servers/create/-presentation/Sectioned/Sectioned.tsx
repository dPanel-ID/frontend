import type { ReactNode } from 'react';

import { cn } from '@/shared/libs/tailwind/cn';
import { Card } from '@/shared/presentation/atoms/Card';

export default function Sectioned(props: Props) {
  const {
    className,
    classNameContent,
    sectionIcon: SectionIcon,
    sectionTitle,
    sectionDescription,
    children,
    withinCard,
  } = props;

  const content = (
    <div className={cn('flex w-full flex-col gap-4 p-4 sm:p-5', className)}>
      {(SectionIcon || sectionTitle) && (
        <div className="flex items-start gap-3 border-b pb-4">
          {SectionIcon && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
              <SectionIcon className="size-4" />
            </div>
          )}
          {sectionTitle && (
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{sectionTitle}</h3>
              {sectionDescription && (
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                  {sectionDescription}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className={cn('min-w-0', classNameContent)}>{children}</div>
    </div>
  );

  if (!withinCard) {
    return content;
  }

  return <Card className="rounded-lg shadow-none">{content}</Card>;
}

interface Props {
  withinCard?: boolean;
  className?: string;
  classNameContent?: string;
  sectionIcon?: (props: { className?: string }) => ReactNode;
  sectionTitle?: string;
  sectionDescription?: string;
  children: ReactNode;
}
