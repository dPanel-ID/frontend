import type { ComponentType } from 'react';

import {
  SiApachekafka,
  SiK3s,
  SiKubernetes,
  SiMariadb,
  SiMongodb,
  SiPostgresql,
  SiRancher,
  SiRedis,
} from '@icons-pack/react-simple-icons';
import { BoxesIcon, FolderTreeIcon } from 'lucide-react';

type IconComponent = ComponentType<{ className?: string }>;

const KIND_ICONS: Record<string, IconComponent> = {
  generic: FolderTreeIcon,
  kubernetes: SiKubernetes,
  postgresql: SiPostgresql,
  mariadb: SiMariadb,
  redis: SiRedis,
  kafka: SiApachekafka,
  mongodb: SiMongodb,
};

const ENGINE_ICONS: Record<string, IconComponent> = {
  k3s: SiK3s,
  rke2: SiRancher,
};

/** The logo of a cluster kind; unknown kinds get a neutral icon. */
export function ClusterKindIcon(props: { kind: string; className?: string }) {
  const Icon = KIND_ICONS[props.kind] ?? BoxesIcon;
  return <Icon className={props.className} />;
}

/** The logo of a cluster engine, falling back to the kind's icon. */
export function ClusterEngineIcon(props: {
  engine: string;
  kind: string;
  className?: string;
}) {
  const Icon = ENGINE_ICONS[props.engine];
  if (!Icon)
    return <ClusterKindIcon kind={props.kind} className={props.className} />;
  return <Icon className={props.className} />;
}
