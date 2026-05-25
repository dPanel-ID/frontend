import { useCallback, useEffect, useState } from 'react';

import {
  Dialog,
  DialogOverlay,
  DialogPortal,
} from '@/shared/presentation/atoms/Dialog';

import { useModalSubscribe } from '../../model/event';
import type { ModalPayload } from '../../rules/types';

export default function ModalController() {
  const [modalPayload, setModalPayload] = useState<ModalPayload>();
  const [isOpen, setIsOpen] = useState(false);
  const [allowClickOutsideClose, setAllowClickOutsideClose] = useState(true);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalPayload(undefined);
    setAllowClickOutsideClose(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !allowClickOutsideClose) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      event.stopPropagation();
      closeModal();
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [allowClickOutsideClose, closeModal, isOpen]);

  useModalSubscribe('%%modal/open', (payload) => {
    setModalPayload(payload);
    setIsOpen(true);
  });

  useModalSubscribe('%%modal/close', () => {
    closeModal();
  });

  useModalSubscribe('%%modal/allow-trivial-close', (value) => {
    setAllowClickOutsideClose(value);
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setIsOpen(true);
          return;
        }

        if (!allowClickOutsideClose) return;

        closeModal();
      }}
    >
      {modalPayload && (
        <DialogPortal>
          <DialogOverlay
            onClick={() => {
              if (!allowClickOutsideClose) return;
              closeModal();
            }}
          />
          {modalPayload.content}
        </DialogPortal>
      )}
    </Dialog>
  );
}
