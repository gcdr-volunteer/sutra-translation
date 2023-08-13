export * from './avatamsaka';

// Following code is only used in local dev
import { getFeedx, getMetaData } from './avatamsaka';
async function main() {
  const metadata = await getMetaData({ sutra: 'T0279', roll: '1' });
  console.log(metadata);
  //   const feed = await getFeedx({ sutra: 'T0279', roll: '1' });
  //   console.log(feed);
}
main();
