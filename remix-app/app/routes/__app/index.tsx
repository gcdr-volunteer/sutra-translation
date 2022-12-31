import { redirect } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderArgs) => {
  return redirect('/dashboard');
};
export default function HomeRoute() {
  return <div>Home</div>;
}
