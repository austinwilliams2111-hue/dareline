import { generateMockGames } from '../data/mockGames';
import { Game, SportLeague } from '../types';

const LEAGUE_ENDPOINTS: { league: SportLeague; url: string; fallbackLine: number }[] = [
  {
    league: 'NBA',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    fallbackLine: 224.5,
  },
  {
    league: 'NFL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    fallbackLine: 47.5,
  },
  {
    league: 'NHL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    fallbackLine: 6.0,
  },
  {
    league: 'Premier League',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
    fallbackLine: 2.5,
  },
];

// Generates YYYYMMDD strings for today + the next `daysAhead` days
function getUpcomingDateStrings(daysAhead: number = 6): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}${mm}${dd}`);
  }
  return dates;
}

export async function fetchRealGames(): Promise<{ games: Game[]; isLiveFeed: boolean }> {
  const dateStrings = getUpcomingDateStrings(6); // Today + next 6 days

  // Build requests across all 4 leagues and all 7 dates
  const requests = LEAGUE_ENDPOINTS.flatMap(({ league, url, fallbackLine }) =>
    dateStrings.map(async (dateStr) => {
      const res = await fetch(`${url}?dates=${dateStr}&limit=50`);
      if (!res.ok) throw new Error(`ESPN ${league} (${dateStr}) failed`);
      const data = await res.json();

      return (data.events ?? [])
        .filter((event: any) => {
          const state = event.competitions?.[0]?.status?.type?.state;
          // Keep ONLY games that are LIVE ('in') or UPCOMING ('pre')
          return state === 'in' || state === 'pre';
        })
        .map((event: any): Game => {
          const comp = event.competitions?.[0];
          const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
          const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
          const state = comp?.status?.type?.state;

          const status: Game['status'] = state === 'in' ? 'LIVE' : 'UPCOMING';
          const shortDetail = comp?.status?.type?.shortDetail || 'Scheduled';
          const overUnder = comp?.odds?.[0]?.overUnder ?? fallbackLine;

          return {
            id: `espn-${event.id}`,
            league,
            status,
            clock: shortDetail,
            homeTeam: {
              name: home?.team?.displayName || 'Home Team',
              abbr: home?.team?.abbreviation || 'HOM',
              score: Number(home?.score ?? 0),
              color: home?.team?.color ? `#${home.team.color}` : '#10b981',
            },
            awayTeam: {
              name: away?.team?.displayName || 'Away Team',
              abbr: away?.team?.abbreviation || 'AWY',
              score: Number(away?.score ?? 0),
              color: away?.team?.color ? `#${away.team.color}` : '#0ea5e9',
            },
            totalPointsLine: Number(overUnder),
            startTime: shortDetail,
          };
        });
    })
  );

  const results = await Promise.allSettled(requests);

  // Deduplicate by event ID (NFL returns the full week's slate on every date query)
  const gameMap = new Map<string, Game>();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const game of r.value) {
        if (!gameMap.has(game.id)) {
          gameMap.set(game.id, game);
        }
      }
    }
  }

  const upcomingAndLiveGames = Array.from(gameMap.values());

  // Sort LIVE games first, then UPCOMING games
  upcomingAndLiveGames.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'LIVE' ? -1 : 1;
  });

  if (upcomingAndLiveGames.length > 0) {
    return { games: upcomingAndLiveGames, isLiveFeed: true };
  }

  return { games: generateMockGames(), isLiveFeed: false };
}