import * as BackupToGit$Id from './deploy.backup-to-git.$id';
import * as Create from './deploy.create';
import * as Delete$Id from './deploy.delete.$id';
import * as Detail$Id from './deploy.detail.$id';
import * as Find from './deploy.find';
import * as GitBackups$Id from './deploy.git-backups.$id';
import * as Releases$Id from './deploy.releases.$id';
import * as Rollback$Id from './deploy.rollback.$id';

const Root = {
  BackupToGit: {
    $Id: BackupToGit$Id,
  },
  Create,
  Detail: {
    $Id: Detail$Id,
  },
  Delete: {
    $Id: Delete$Id,
  },
  Find,
  GitBackups: {
    $Id: GitBackups$Id,
  },
  Releases: {
    $Id: Releases$Id,
  },
  Rollback: {
    $Id: Rollback$Id,
  },
};

export default Root;
