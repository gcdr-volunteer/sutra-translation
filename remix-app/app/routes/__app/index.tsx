import { LoaderArgs, redirect } from '@remix-run/node';
import { assertAuthUser } from '~/auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  return redirect('/dashboard');
};
export default function HomeRoute() {
  return <div>Home</div>;
}
