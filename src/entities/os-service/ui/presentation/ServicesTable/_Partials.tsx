import { useRef, useState } from 'react';

import {
  ActivityIcon,
  CirclePlayIcon,
  CircleStopIcon,
  EyeIcon,
  RotateCcwIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { SchemaOsServiceParts } from '@/entities/os-service/rules/schema';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Dropdown } from '@/shared/presentation/atoms/Dropdown';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { ServiceState } from '../ServiceState';

import type { ServiceTableRowProps } from './types';

function RowHeader() {
  const t = useDevetekTranslations();

  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)_180px] items-center gap-3 border-b bg-background/60 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">
        {t('common.terms.state')}
      </p>
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">
        {t('common.terms.serviceName')}
      </p>
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">
        {t('common.terms.actions')}
      </p>
    </div>
  );
}

function Row(props: ServiceTableRowProps) {
  const { serviceName, serviceState, onClickServiceDetail, onClickActivity } =
    props;

  const refDropdownTarget = useRef<HTMLButtonElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const t = useDevetekTranslations();

  const handleClickActivity = (activity: SchemaOsServiceParts.Activity) => {
    return () => {
      onClickActivity?.(activity);
      setDropdownOpen(false);
    };
  };

  return (
    <>
      <div className="grid grid-cols-[150px_minmax(0,1fr)_180px] items-center gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-border/30">
        <div className="flex min-w-0 items-center gap-2">
          <ServiceState.Badge className="size-4" serviceState={serviceState} />
          <ServiceState.Label
            as="span"
            className="truncate text-sm font-medium"
            serviceState={serviceState}
          />
        </div>

        <p className="min-w-0 truncate font-mono text-sm text-primary">
          {serviceName}
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="outline"
            onClick={onClickServiceDetail}
          >
            <EyeIcon className="size-4" />
            {t('common.actions.details')}
          </Button>

          <Button
            ref={refDropdownTarget}
            size="icon-sm"
            buttonColor="secondary"
            buttonStyle="outline"
            aria-label="Service activity"
            title="Service activity"
            onClick={() => setDropdownOpen(true)}
          >
            <ActivityIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Dropdown
        refTarget={refDropdownTarget}
        isOpen={dropdownOpen}
        alignment="right"
        position="bottom"
        gapInPx={6}
        onClickOutside={() => setDropdownOpen(false)}
      >
        <div className="grid min-w-40 gap-1 p-2">
          <Button
            buttonStyle="ghost"
            buttonColor="secondary"
            onClick={handleClickActivity('start')}
          >
            <CirclePlayIcon className="size-4" /> {t('common.actions.start')}
          </Button>

          <Button
            buttonStyle="ghost"
            buttonColor="secondary"
            onClick={handleClickActivity('restart')}
          >
            <RotateCcwIcon className="size-4" />
            {t('common.actions.restart')}
          </Button>

          <Button
            buttonStyle="ghost"
            buttonColor="secondary"
            onClick={handleClickActivity('reload')}
          >
            <RotateCcwIcon className="size-4" /> {t('common.actions.reload')}
          </Button>

          <Button
            buttonStyle="ghost"
            buttonColor="secondary"
            onClick={handleClickActivity('stop')}
          >
            <CircleStopIcon className="size-4" /> {t('common.actions.stop')}
          </Button>
        </div>
      </Dropdown>
    </>
  );
}

Row.PlaceholderLoading = function PlaceholderLoading() {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)_180px] items-center gap-3 border-b px-3 py-2 last:border-b-0">
      <div className="flex items-center gap-2">
        <Shimmer className="size-4" />
        <Shimmer className="h-5 w-20" />
      </div>

      <Shimmer className="h-5 w-48" />

      <div className="flex items-center gap-2">
        <Shimmer className="h-8 w-24" />
        <Shimmer className="size-8" />
      </div>
    </div>
  );
};

export const ServiceTablePartials = {
  RowHeader,
  Row,
};
