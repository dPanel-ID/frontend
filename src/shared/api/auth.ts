import * as GithubLogin from './auth.github-login';
import * as Logout from './auth.logout';
import * as SignInMethods from './auth.sign-in-methods';
import * as SignInMethods$Provider from './auth.sign-in-methods.$provider';

const Root = {
  GithubLogin,
  Logout,
  SignInMethods: {
    ...SignInMethods,
    $Provider: SignInMethods$Provider,
  },
};

export default Root;
