import * as ResourceFind from './admin.resource.find';
import * as ServerFind from './admin.server.find';
import * as ServerRemoved from './admin.server.removed';
import * as Task$IdDelete from './admin.task.$id.delete';
import * as Task$IdReclaim from './admin.task.$id.reclaim';
import * as TaskFind from './admin.task.find';

const Root = {
  Resource: {
    Find: ResourceFind,
  },
  Server: {
    Find: ServerFind,
    Removed: ServerRemoved,
  },
  Task: {
    Find: TaskFind,
    $Id: {
      Delete: Task$IdDelete,
      Reclaim: Task$IdReclaim,
    },
  },
};

export default Root;
