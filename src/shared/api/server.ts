import * as Create from './server.create';
import * as Delete$Id from './server.delete.$id';
import * as Detail$Id from './server.detail.$id';
import * as Detail$IdLog from './server.detail.$id.log';
import * as Find from './server.find';
import * as Modules$Id from './server.modules.$id';
import * as Modules$Id$InstallationId from './server.modules.$id.$installationId';
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
  Modules: {
    $Id: {
      ...Modules$Id,
      $InstallationId: Modules$Id$InstallationId,
      Refresh: Modules$IdRefresh,
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
