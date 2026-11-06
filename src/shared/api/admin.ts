import * as ResourceFind from './admin.resource.find';
import * as Task$IdDelete from './admin.task.$id.delete';
import * as Task$IdReclaim from './admin.task.$id.reclaim';
import * as TaskFind from './admin.task.find';

const Root = {
  Resource: {
    Find: ResourceFind,
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
