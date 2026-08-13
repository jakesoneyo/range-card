/**
 * SearchPlayerStatsQuerySchema 단위 테스트 — shard가 공식 API 지원 플랫폼 값으로
 * 제한되는지 검증한다(임의 문자열 주입 방지, S-1).
 */
import { SearchPlayerStatsQuerySchema } from './search-query.dto';

describe('SearchPlayerStatsQuerySchema', () => {
  it.each(['steam', 'kakao', 'psn', 'xbox'])('%s shard는 통과한다', (shard) => {
    const result = SearchPlayerStatsQuerySchema.safeParse({
      shard,
      name: '닉네임',
    });
    expect(result.success).toBe(true);
  });

  it('지원하지 않는 shard 값은 거부한다', () => {
    const result = SearchPlayerStatsQuerySchema.safeParse({
      shard: 'not-a-real-shard',
      name: '닉네임',
    });
    expect(result.success).toBe(false);
  });
});
