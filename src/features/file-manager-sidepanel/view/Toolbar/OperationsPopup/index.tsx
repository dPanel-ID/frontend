import { useEffect, useRef, useState } from 'react';

import { useBrowserModel } from '@/features/file-manager-sidepanel/model/browser';
import { useEmit } from '@/features/file-manager-sidepanel/model/events';

import { iife } from '@/shared/libs/browser/fn';
import { Dropdown } from '@/shared/presentation/atoms/Dropdown';

import { OperationEmptyState, OperationRow } from './_Partials';

interface OperationsPopupProps {
  refTarget: HTMLButtonElement | null;
}

export default function OperationsPopup(props: OperationsPopupProps) {
  const { refTarget } = props;

  const emit = useEmit();

  const [isDropdownUploadOpen, setIsDropdownUploadOpen] = useState(false);

  const [fsOperationReports] = useBrowserModel((s) => [s.fsOperationReports]);

  const refTargetCached = useRef<HTMLButtonElement>(null);
  const refOperationReportCount = useRef(fsOperationReports.length);

  useEffect(() => {
    if (!Object.is(refTargetCached.current, refTarget)) {
      refTargetCached.current = refTarget;
    }
  });

  useEffect(() => {
    const handleClick = () => {
      setIsDropdownUploadOpen((prev) => !prev);
    };

    refTarget?.addEventListener('click', handleClick);

    return () => {
      refTarget?.removeEventListener('click', handleClick);
    };
  }, [emit, refTarget]);

  useEffect(() => {
    if (refOperationReportCount.current === fsOperationReports.length) return;

    refOperationReportCount.current = fsOperationReports.length;

    const timeout = window.setTimeout(() => {
      setIsDropdownUploadOpen(true);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fsOperationReports.length]);

  const elContent = iife(() => {
    if (fsOperationReports.length < 1) {
      return <OperationEmptyState />;
    }

    return fsOperationReports
      .toReversed()
      .map((opReport) => (
        <OperationRow key={opReport.id} operationReport={opReport} />
      ));
  });

  return (
    <Dropdown
      gapInPx={4}
      refTarget={refTargetCached}
      alignment="right"
      position="bottom"
      isOpen={isDropdownUploadOpen}
      className="overflow-hidden rounded-lg border bg-card shadow-lg"
      onClickOutside={() => setIsDropdownUploadOpen(false)}
    >
      <div className="max-h-[300px] w-80 overflow-hidden overflow-y-auto p-3">
        <div className="flex min-h-full w-full flex-col gap-y-3 overflow-hidden">
          {elContent}
        </div>
      </div>
    </Dropdown>
  );
}
