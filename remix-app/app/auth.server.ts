// app/services/auth.server.ts
import { Authenticator } from 'remix-auth';
import { sessionStorage } from './session.server';
import { User } from './types/user';
import { FormStrategy } from 'remix-auth-form';
import invariant from 'tiny-invariant';
import bcrypt from 'bcryptjs';
import { LoaderArgs } from '@remix-run/node';
import { getUserByEmail } from './models/user';
export let authenticator = new Authenticator<User | undefined>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    let username = form.get('username');
    let password = form.get('password');

    const user = await getUserByEmail(username as string);
    if (user) {
      const isValid = await bcrypt.compare(password as string, user.password);
      if (isValid) {
        const { password, ...rest } = user;
        return rest;
      }
      return undefined;
    }
    return undefined;
  })
);

export const assertAuthUser = async (request: LoaderArgs['request']) => {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
};
