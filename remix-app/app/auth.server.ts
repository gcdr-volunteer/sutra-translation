// app/services/auth.server.ts
import { Authenticator } from 'remix-auth';
import { sessionStorage } from './session.server';
import { FormStrategy } from 'remix-auth-form';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from './models/user';
import { logger } from '~/utils';
import type { User } from './types/user';
import type { LoaderArgs } from '@remix-run/node';
export let authenticator = new Authenticator<User | undefined>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    let username = form.get('username');
    let password = form.get('password');

    logger.info('authenticator', 'before getUserByEmail');
    const user = await getUserByEmail(username as string);
    logger.info('authenticator', 'after getUserByEmail');
    logger.log('authenticator', 'user', user);
    if (user) {
      logger.info('authenticator', 'before bcrypt compare');
      const isValid = await bcrypt.compare(password as string, user.password);
      logger.info('authenticator', 'after bcrypt compare');
      logger.log('authenticator', 'isValid', isValid);
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
