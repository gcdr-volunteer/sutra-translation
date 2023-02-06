import { describe, expect, test } from 'vitest';
import { getFeed1, getMetaData, getFeedx } from '../avatamsaka';

describe('avatamsaka sutra feed', () => {
  test('should match metadata snapshot', async () => {
    const metadata = await getMetaData({ sutra: 'T0279', roll: '1' });
    expect(metadata).toMatchSnapshot();
  });
  test('should match avatamsaka roll 1 snapshot', async () => {
    const feed = await getFeed1({ roll: '1', sutra: 'T0279' });
    expect(feed).toMatchSnapshot();
  });
  test('should match avatamsaka roll 2 snapshot', async () => {
    const feed = await getFeedx({ roll: '2', sutra: 'T0279' });
    expect(feed).toMatchSnapshot();
  });
  test('should match avatamsaka roll 3 snapshot', async () => {
    const feed = await getFeedx({ roll: '3', sutra: 'T0279' });
    expect(feed).toMatchSnapshot();
  });
});
