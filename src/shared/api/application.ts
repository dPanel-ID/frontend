import * as Branch$Id from './application.branch.$id';
import * as Branches$Id from './application.branches.$id';
import * as BuildProgress$Id from './application.build-progress.$id';
import * as Create from './application.create';
import * as Delete$Id from './application.delete.$id';
import * as Detail$Id from './application.detail.$id';
import * as EnvironmentReveal$Id from './application.environment.reveal.$id';
import * as Find from './application.find';
import * as IAC$Id from './application.iac.$id';
import * as Logs$Id from './application.logs.$id';
import * as LogsRaw$Id from './application.logs.raw.$id';
import * as Preflight from './application.preflight';
import * as Preset from './application.preset';
import * as Update$Id from './application.update.$id';

const Root = {
  Branch: {
    $Id: Branch$Id,
  },
  Branches: {
    $Id: Branches$Id,
  },
  BuildProgress: {
    $Id: BuildProgress$Id,
  },
  Create,
  Delete: {
    $Id: Delete$Id,
  },
  Detail: {
    $Id: Detail$Id,
  },
  EnvironmentReveal: {
    $Id: EnvironmentReveal$Id,
  },
  Find,
  IAC: {
    $Id: IAC$Id,
  },
  Logs: {
    $Id: Logs$Id,
    Raw: LogsRaw$Id,
  },
  Preflight,
  Preset,
  Update: {
    $Id: {
      ...Update$Id,
    },
  },
};

export default Root;
