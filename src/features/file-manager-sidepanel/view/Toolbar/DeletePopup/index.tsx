import { useEffect, useRef, useState } from 'react';

import { FileWarningIcon } from 'lucide-react';

import { useBrowserModel } from '@/features/file-manager-sidepanel/model/browser';
import { useEmit } from '@/features/file-manager-sidepanel/model/events';

import { Button } from '@/shared/presentation/atoms/Button';
import { Dropdown } from '@/shared/presentation/atoms/Dropdown';

interface UploadPopupProps {
  refTarget: HTMLButtonElement | null;
}

export default function DeletePopup(props: UploadPopupProps) {
  const { refTarget } = props;

  const emit = useEmit();

  const [selectedItem] = useBrowserModel((s) => [s.selectedItem]);

  const [isDropdownUploadOpen, setIsDropdownUploadOpen] = useState(false);

  const refTargetCached = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!Object.is(refTargetCached.current, refTarget)) {
      refTargetCached.current = refTarget;
    }
  });

  useEffect(() => {
    const handleClick = () => {
      setIsDropdownUploadOpen(true);
    };

    refTarget?.addEventListener('click', handleClick);

    return () => {
      refTarget?.removeEventListener('click', handleClick);
    };
  }, [refTarget]);

  const handleClickYes = () => {
    setIsDropdownUploadOpen(false);
    emit('#file-manager-sidepanel/tool-selected-item-delete', null);
  };

  return (
    <Dropdown
      gapInPx={4}
      className="rounded-lg border bg-card shadow-lg"
      refTarget={refTargetCached}
      alignment="right"
      position="bottom"
      isOpen={isDropdownUploadOpen}
      onClickOutside={() => setIsDropdownUploadOpen(false)}
    >
      <div className="flex w-[240px] flex-col items-center overflow-hidden p-4">
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-background">
          <FileWarningIcon className="size-5 text-muted-foreground" />
        </div>

        <p className="text-center text-sm font-medium text-primary">
          Are you sure you want to delete the following {selectedItem?.kind}:
        </p>

        <div className="my-3 max-w-full overflow-hidden rounded-md border bg-background px-2 py-1">
          <p className="w-full overflow-hidden text-ellipsis text-center text-sm text-primary">
            {selectedItem?.name}
          </p>
        </div>

        <Button
          className="w-full border-red-500"
          variant="outline"
          size="sm"
          onClick={handleClickYes}
        >
          Yes
        </Button>
      </div>
    </Dropdown>
  );
}
