import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export const loader = () => redirect('/login');

export const action = ({ request }: ActionFunctionArgs) => {
  console.log('1', request.url);
  return authenticator.authenticate('google', request);
};
