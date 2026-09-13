import * as Create from './host-group.create';
import * as Detail$Id from './host-group.detail.$id';
import * as Find from './host-group.find';
import * as Members$Id from './host-group.members.$id';
import * as Operation$Id from './host-group.operation.$id';
import * as Operations$Id from './host-group.operations.$id';

const Root = {
  Create,
  Detail: {
    $Id: Detail$Id,
  },
  Find,
  Members: {
    $Id: Members$Id,
  },
  Operation: {
    $Id: Operation$Id,
  },
  Operations: {
    $Id: Operations$Id,
  },
};

export default Root;
