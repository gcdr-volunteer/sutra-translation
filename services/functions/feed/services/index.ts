export * from './avatamsaka';

// Following code is only used in local dev
import { getFeedx } from './avatamsaka';
async function main() {
  const feed = await getFeedx({ sutra: 'T0279', roll: '4' });
  console.log(feed);
}
main();
