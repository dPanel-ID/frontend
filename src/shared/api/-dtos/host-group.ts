import type { MachineV1 } from '.';
import type {
  HostGroupActionResponseDto,
  HostGroupActionTargetDto,
  HostGroupDto,
  HostGroupOperationDetailDto,
  HostGroupOperationDto,
  HostGroupOperationTargetDto,
} from '@/shared/rules/host-group';

export interface HostGroupV1
  extends Omit<HostGroupDto, 'members'> {
  members?: MachineV1[];
}

export type HostGroupOperationV1 = HostGroupOperationDto;

export type HostGroupOperationTargetV1 = HostGroupOperationTargetDto;

export type HostGroupOperationDetailV1 = HostGroupOperationDetailDto;

export type HostGroupActionTargetV1 = HostGroupActionTargetDto;

export type HostGroupActionResponseV1 = HostGroupActionResponseDto;
