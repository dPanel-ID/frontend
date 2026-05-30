import * as Action$Name$Action from './module.action.$name.$action';
import * as Action$Name$ActionRun from './module.action.$name.$action.run';
import * as CustomRun from './module.custom.run';
import * as Detail$Name from './module.detail.$name';
import * as Find from './module.find';
import * as Repository from './module.repository';

const Root = {
  Action: {
    $Name: {
      $Action: {
        ...Action$Name$Action,
        Run: Action$Name$ActionRun,
      },
    },
  },
  Custom: {
    Run: CustomRun,
  },
  Detail: {
    $Name: Detail$Name,
  },
  Find,
  Repository,
};

export default Root;
