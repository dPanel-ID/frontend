import { Fragment, useCallback, useEffect, useState } from 'react';

import Drawer from '@/shared/presentation/atoms/Drawer';

import { useSidepanelSubscribe } from '../../model/event';
import type { SidepanelPayload } from '../../rules/types';

const generateId = () => String(Math.floor(Math.random() * 1_000_000));

export default function SidepanelController() {
  const [payloadList, setPayloadList] = useState<
    Array<[id: string, SidepanelPayload]>
  >([]);
  const [allowClickOutsideClose, setAllowClickOutsideClose] = useState(true);

  useSidepanelSubscribe('%%sidepanel/open', (sidepanelPayload) => {
    setPayloadList([[generateId(), sidepanelPayload]]);
  });

  useSidepanelSubscribe('%%sidepanel/push', (sidepanelPayload) => {
    setPayloadList([...payloadList, [generateId(), sidepanelPayload]]);
  });

  useSidepanelSubscribe('%%sidepanel/pop', () => {
    setPayloadList((prev) => {
      const newList = [...prev];
      newList.pop();
      return newList;
    });
  });

  useSidepanelSubscribe('%%sidepanel/close', () => {
    setPayloadList([]);
    setAllowClickOutsideClose(true);
  });

  useSidepanelSubscribe('%%sidepanel/allow-trivial-close', (value) => {
    setAllowClickOutsideClose(value);
  });

  const closeTopSidepanel = useCallback(() => {
    if (!allowClickOutsideClose || payloadList.length < 1) return false;

    setPayloadList((prev) => {
      if (prev.length < 1) return prev;

      const newList = [...prev];
      newList.pop();
      return newList;
    });

    return true;
  }, [allowClickOutsideClose, payloadList.length]);

  const handleClickOverlay = () => {
    closeTopSidepanel();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;

      const didClose = closeTopSidepanel();
      if (!didClose) return;

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeTopSidepanel]);

  return (
    <Drawer position="right" zIndex={40} onClickOverlay={handleClickOverlay}>
      {payloadList.map((payload) => {
        const [id, sidepanelPayload] = payload;

        return <Fragment key={id}>{sidepanelPayload.content}</Fragment>;
      })}
    </Drawer>
  );
}
