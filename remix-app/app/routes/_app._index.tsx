import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return redirect('/dashboard');
};
export default function HomeRoute() {
  return <div>Home</div>;
}
