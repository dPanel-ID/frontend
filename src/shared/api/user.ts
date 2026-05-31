import * as Detail$Id from './user.detail.$id';
import * as Find from './user.find';
import * as Login from './user.login';
import * as Profile from './user.profile';
import * as ProfileUpdate from './user.profile.update';
import * as Register from './user.register';
import * as Update$Id from './user.update.$id';

const Root = {
  Detail: {
    $Id: Detail$Id,
  },
  Find,
  Login,
  Profile: {
    ...Profile,
    Update: ProfileUpdate,
  },
  Register,
  Update: {
    $Id: Update$Id,
  },
};

export default Root;
