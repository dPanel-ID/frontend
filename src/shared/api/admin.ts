import * as Task$IdDelete from './admin.task.$id.delete';
import * as Task$IdReclaim from './admin.task.$id.reclaim';
import * as TaskFind from './admin.task.find';

const Root = {
  Task: {
    Find: TaskFind,
    $Id: {
      Delete: Task$IdDelete,
      Reclaim: Task$IdReclaim,
    },
  },
};

export default Root;
