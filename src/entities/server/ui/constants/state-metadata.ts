import {
  CheckCircleIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  CircleXIcon,
  ClockIcon,
  HourglassIcon,
  TrashIcon,
} from 'lucide-react';

import type { SchemaServerParts } from '../../rules/schema';
import type { ServerStateMetadata } from '../../rules/types';

export const SERVER_STATE_METADATA: Record<
  SchemaServerParts.State['status'],
  ServerStateMetadata
> = {
  pending: {
    tone: 'neutral',
    pulse: true,
    showIcon: false,
    icon: HourglassIcon,
    color: '--color-gray-500',
    i18n: {
      statusLabel: 'common.terms.pending',
    },
  },
  ready: {
    tone: 'success',
    pulse: false,
    showIcon: false,
    icon: CheckCircleIcon,
    color: '--color-green-600',
    i18n: {
      statusLabel: 'common.terms.ready',
    },
  },
  progress: {
    tone: 'info',
    pulse: true,
    showIcon: false,
    icon: ClockIcon,
    color: '--color-cyan-500',
    i18n: {
      statusLabel: 'common.terms.inProgress',
    },
  },
  cancelled: {
    tone: 'neutral',
    pulse: false,
    showIcon: true,
    icon: CircleXIcon,
    color: '--color-yellow-500',
    i18n: {
      statusLabel: 'common.terms.cancelled',
    },
  },
  deleting: {
    tone: 'warning',
    pulse: true,
    showIcon: false,
    icon: TrashIcon,
    color: '--color-orange-500',
    i18n: {
      statusLabel: 'common.terms.deleting',
    },
  },
  deleted: {
    tone: 'neutral',
    pulse: false,
    showIcon: true,
    icon: TrashIcon,
    color: '--color-yellow-500',
    i18n: {
      statusLabel: 'common.terms.deleted',
    },
  },
  failed: {
    tone: 'danger',
    pulse: false,
    showIcon: true,
    icon: CircleAlertIcon,
    color: '--color-red-500',
    i18n: {
      statusLabel: 'common.terms.failed',
    },
  },
  unknown: {
    tone: 'neutral',
    pulse: false,
    showIcon: false,
    icon: CircleDashedIcon,
    color: '--color-gray-500',
    i18n: {
      statusLabel: 'common.terms.unknown',
    },
  },
};
