export type SupportedModule =
  | 'application'
  | 'server'
  | 'domain'
  | 'load-balancer'
  | 'cloud-project'
  | 'ssh-key';

export interface Module {
  type: SupportedModule;
  moduleId: string;
  moduleName: string;
  /** The workspace the resource is in now; absent when it is personal. */
  moduleTeam?: {
    name: string;
    /** Casdoor workspace group ID. */
    id?: string;
  };
}

// type Mod<M extends string, T> = { type: M } & T;

export interface MigrateOwnershipModalProps {
  mod: Module;
  onSuccess?: () => void;
}
