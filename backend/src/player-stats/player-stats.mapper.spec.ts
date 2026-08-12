/**
 * toPlayerModeStats 단위 테스트 — JSON:API gameModeStats → modes[] 정규화, 방어적 처리.
 */
import { toPlayerModeStats } from './player-stats.mapper';

describe('toPlayerModeStats', () => {
  it('gameModeStats의 각 모드를 배열 원소로 변환한다', () => {
    const payload = {
      data: {
        attributes: {
          gameModeStats: {
            solo: {
              roundsPlayed: 5,
              wins: 1,
              top10s: 3,
              kills: 10,
              assists: 2,
              headshotKills: 1,
              longestKill: 55.5,
            },
            'duo-fpp': {
              roundsPlayed: 8,
              wins: 0,
              top10s: 2,
              kills: 4,
              assists: 1,
              headshotKills: 0,
              longestKill: 12,
            },
          },
        },
      },
    };

    const modes = toPlayerModeStats(payload);

    expect(modes).toHaveLength(2);
    expect(modes).toContainEqual({
      mode: 'solo',
      roundsPlayed: 5,
      wins: 1,
      top10s: 3,
      kills: 10,
      assists: 2,
      headshotKills: 1,
      longestKillM: 55.5,
    });
  });

  it('예상과 다른 형태의 payload(null/빈 객체/구조 불일치)면 빈 배열을 반환한다', () => {
    expect(toPlayerModeStats(null)).toEqual([]);
    expect(toPlayerModeStats({})).toEqual([]);
    expect(toPlayerModeStats({ data: {} })).toEqual([]);
    expect(toPlayerModeStats({ data: { attributes: {} } })).toEqual([]);
  });

  it('숫자가 아닌 필드는 0으로 취급한다', () => {
    const payload = {
      data: {
        attributes: {
          gameModeStats: {
            squad: { roundsPlayed: 'not-a-number' },
          },
        },
      },
    };

    expect(toPlayerModeStats(payload)).toEqual([
      {
        mode: 'squad',
        roundsPlayed: 0,
        wins: 0,
        top10s: 0,
        kills: 0,
        assists: 0,
        headshotKills: 0,
        longestKillM: 0,
      },
    ]);
  });
});
