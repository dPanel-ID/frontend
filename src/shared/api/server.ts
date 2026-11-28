import * as AgentInstall from './server.agent-install';
import * as AgentInstallStatus$Id from './server.agent-install-status.$id';
import * as AgentUpgrade$Id from './server.agent-upgrade.$id';
import * as Create from './server.create';
import * as Delete$Id from './server.delete.$id';
import * as Detail$Id from './server.detail.$id';
import * as Detail$IdLog from './server.detail.$id.log';
import * as Find from './server.find';
import * as Firewall$Id from './server.firewall.$id';
import * as Firewall$IdApply from './server.firewall.$id.apply';
import * as Firewall$IdDisable from './server.firewall.$id.disable';
import * as Firewall$IdImport from './server.firewall.$id.import';
import * as Firewall$IdLive from './server.firewall.$id.live';
import * as Firewall$IdPlan from './server.firewall.$id.plan';
import * as Firewall$IdRules from './server.firewall.$id.rules';
import * as Firewall$IdRules$RuleId from './server.firewall.$id.rules.$ruleId';
import * as Modules$Id from './server.modules.$id';
import * as Modules$Id$InstallationId from './server.modules.$id.$installationId';
import * as Modules$IdAdopt from './server.modules.$id.adopt';
import * as Modules$IdHealth from './server.modules.$id.health';
import * as Modules$IdRefresh from './server.modules.$id.refresh';
import * as Origin$IdCpu from './server.origin.$id.cpu';
import * as Origin$IdCpuUsage from './server.origin.$id.cpu.usage';
import * as Origin$IdDiskUsage from './server.origin.$id.disk.usage';
import * as Origin$IdLog from './server.origin.$id.log';
import * as Origin$IdMemoryUsage from './server.origin.$id.memory.usage';
import * as Origin$IdNetworkInterface from './server.origin.$id.network-interface';
import * as Origin$IdPortInUsed from './server.origin.$id.port-in-used';
import * as Origin$IdUser from './server.origin.$id.user';
import * as Origin$IdUserCreate from './server.origin.$id.user.create';
import * as Origin$IdUserDelete from './server.origin.$id.user.delete';
import * as Removed from './server.removed';
import * as Setup$Id from './server.setup.$id';
import * as Update$Id from './server.update.$id';

const Root = {
  Create,
  Delete: {
    $Id: Delete$Id,
  },
  Detail: {
    $Id: {
      ...Detail$Id,
      Log: Detail$IdLog,
    },
  },
  Find,
  Removed,
  Firewall: {
    $Id: {
      ...Firewall$Id,
      Apply: Firewall$IdApply,
      Disable: Firewall$IdDisable,
      Import: Firewall$IdImport,
      Live: Firewall$IdLive,
      Plan: Firewall$IdPlan,
      Rules: {
        ...Firewall$IdRules,
        $RuleId: Firewall$IdRules$RuleId,
      },
    },
  },
  Modules: {
    $Id: {
      ...Modules$Id,
      $InstallationId: Modules$Id$InstallationId,
      Refresh: Modules$IdRefresh,
      Adopt: Modules$IdAdopt,
      Health: Modules$IdHealth,
    },
  },
  Origin: {
    $Id: {
      Cpu: {
        ...Origin$IdCpu,
        Usage: Origin$IdCpuUsage,
      },
      Disk: {
        Usage: Origin$IdDiskUsage,
      },
      Log: Origin$IdLog,
      Memory: {
        Usage: Origin$IdMemoryUsage,
      },
      NetworkInterface: Origin$IdNetworkInterface,
      PortInUsed: Origin$IdPortInUsed,
      User: {
        ...Origin$IdUser,
        Create: Origin$IdUserCreate,
        Delete: Origin$IdUserDelete,
      },
    },
  },
  AgentInstall,
  AgentInstallStatus: {
    $Id: AgentInstallStatus$Id,
  },
  AgentUpgrade: {
    $Id: AgentUpgrade$Id,
  },
  Setup: {
    $Id: Setup$Id,
  },
  Update: {
    $Id: {
      ...Update$Id,
    },
  },
};

export default Root;
