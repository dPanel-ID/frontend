import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ArtifactLogsModalProps {
  applicationId: SchemaCommon.UnitId;
  artifactId: SchemaCommon.UnitId;
  serverId?: SchemaCommon.UnitId;
  commitHead: string;
}
