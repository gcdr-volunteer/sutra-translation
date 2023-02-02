import { describe, expect, test } from 'vitest';
import { getFeed, getMetaData } from '../avatamsaka';

describe('avatamsaka sutra feed', () => {
  test('should match metadata snapshot', async () => {
    const metadata = await getMetaData({ sutra: 'T0279', roll: '1' });
    expect(metadata).toMatchSnapshot();
  });
  test('should match avatamsaka roll 1 snapshot', async () => {
    const feed = await getFeed({ roll: '1', sutra: 'T0279' });
    expect(feed).toMatchSnapshot();
  });
});
