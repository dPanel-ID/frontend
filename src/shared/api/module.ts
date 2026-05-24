import * as Action$Name$Action from './module.action.$name.$action';
import * as Detail$Name from './module.detail.$name';
import * as Find from './module.find';

const Root = {
  Action: {
    $Name: {
      $Action: Action$Name$Action,
    },
  },
  Detail: {
    $Name: Detail$Name,
  },
  Find,
};

export default Root;
