import type { MachineV1 } from '.';
import type {
  HostGroupActionResponseDto,
  HostGroupActionTargetDto,
  HostGroupDeploymentActionResponseDto,
  HostGroupDetailDto,
  HostGroupModuleActionResponseDto,
  HostGroupOperationDetailDto,
  HostGroupOperationDto,
  HostGroupOperationTargetDto,
  HostGroupSummaryDto,
} from '@/shared/rules/host-group';

export interface HostGroupV1 extends HostGroupSummaryDto {
  members?: Array<MachineV1 | HostGroupDetailDto['members'][number]>;
  member_count?: number;
}

export type HostGroupOperationV1 = HostGroupOperationDto;

export type HostGroupOperationTargetV1 = HostGroupOperationTargetDto;

export type HostGroupOperationDetailV1 = HostGroupOperationDetailDto;

export type HostGroupActionTargetV1 = HostGroupActionTargetDto;

export type HostGroupActionResponseV1 = HostGroupActionResponseDto;

export type HostGroupDetailV1 = HostGroupDetailDto;

export type HostGroupSummaryV1 = HostGroupSummaryDto;

export type HostGroupModuleActionResponseV1 =
  HostGroupModuleActionResponseDto;

export type HostGroupDeploymentActionResponseV1 =
  HostGroupDeploymentActionResponseDto;
