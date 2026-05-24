import type { RefObject } from 'react';
import { useState } from 'react';

import { useEmit } from '@/features/file-manager-sidepanel/model/events';

import { Button } from '@/shared/presentation/atoms/Button';
import { Dropdown } from '@/shared/presentation/atoms/Dropdown';
import { InputWithValidation } from '@/shared/presentation/molecules/InputWithValidation';

interface NewFolderPopupProps {
  refTarget: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function NewFolderPopup(props: NewFolderPopupProps) {
  const { refTarget, isOpen, onOpenChange } = props;

  const emit = useEmit();

  const [folderName, setFolderName] = useState('');

  const handleClickCreate = () => {
    const acceptedFolderName = folderName.trim();
    if (!acceptedFolderName) return;

    emit('#file-manager-sidepanel/tool-current-path-folder-new', {
      folderName: acceptedFolderName,
      permissionCode: '0770',
    });

    setFolderName('');
    onOpenChange(false);
  };

  return (
    <Dropdown
      gapInPx={4}
      refTarget={refTarget}
      alignment="right"
      position="bottom"
      isOpen={isOpen}
      onClickOutside={() => onOpenChange(false)}
      className="rounded-2xl"
    >
      <div className="p-3 flex flex-col gap-y-1 w-60">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm font-bold text-primary">Folder Name:</p>

          <Button
            disabled={!folderName}
            size="xs"
            variant="link"
            onClick={handleClickCreate}
          >
            Create
          </Button>
        </div>
        <InputWithValidation
          placeholder="Fill in the folder's name"
          onAcceptedChange={setFolderName}
          validations={[
            /^[a-zA-Z0-9_-]+$/,
            (value) =>
              value.length > 100 ? 'Must be 100 characters or less' : true,
          ]}
        />
      </div>
    </Dropdown>
  );
}
