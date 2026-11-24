import { Game, SportLeague } from '../types';

export const PRESET_DARES = [
  'Loser buys the winner iced coffee before the next game',
  'Loser posts an embarrassing throwback photo on their story for 24 hours',
  'Loser wears the rival team’s jersey or colors for a full day',
  'Loser has to do 30 pushups on video call right after the final whistle',
  'Loser changes their profile picture to the winning team logo for a week',
  'Loser makes a 15-second dramatic apology video praising the winning team',
];

const CITIES = [
  'Boston', 'Los Angeles', 'Denver', 'Dallas', 'Phoenix', 'Golden State',
  'Miami', 'New York', 'Oklahoma City', 'Milwaukee', 'Memphis', 'Minnesota',
  'Buffalo', 'Kansas City', 'Detroit', 'San Francisco', 'Cincinnati', 'Baltimore',
  'Philadelphia', 'Chicago', 'Green Bay', 'Toronto', 'Edmonton', 'Vegas',
  'Colorado', 'Ottawa', 'Montreal', 'Calgary', 'Vancouver', 'London',
  'Manchester', 'Liverpool', 'Chelsea', 'Aston', 'Newcastle', 'Seattle',
  'Portland', 'Atlanta', 'Orlando', 'Houston', 'Austin', 'Nashville',
];

const PUNNY_MASCOTS: { name: string; abbr: string }[] = [
  { name: 'Cream Pies', abbr: 'PIE' },
  { name: 'Airballers', abbr: 'AIR' },
  { name: 'Chicken Nuggets', abbr: 'NUG' },
  { name: 'Bricklayers', abbr: 'BRK' },
  { name: 'Sunscreen', abbr: 'SPF' },
  { name: 'Couch Potatoes', abbr: 'SPU' },
  { name: 'Lukewarms', abbr: 'WMR' },
  { name: 'Knickerbockers', abbr: 'KNK' },
  { name: 'Mild Drizzles', abbr: 'DRZ' },
  { name: 'Five-Bucks', abbr: 'BKS' },
  { name: 'Teddy Bears', abbr: 'TED' },
  { name: 'Timber-Waffles', abbr: 'WAF' },
  { name: 'Dollar Bills', abbr: 'BIL' },
  { name: 'Sous-Chefs', abbr: 'CHF' },
  { name: 'Dandelions', abbr: 'DND' },
  { name: 'Forty-Whiners', abbr: 'WHN' },
  { name: 'Bagels', abbr: 'BGL' },
  { name: 'Quoth-The-Pigeons', abbr: 'PGN' },
  { name: 'Couchboys', abbr: 'CCH' },
  { name: 'Beagles', abbr: 'BGE' },
  { name: 'Gummy Bears', abbr: 'GMY' },
  { name: 'Fudge Packers', abbr: 'PCK' },
  { name: 'Paper Airplanes', abbr: 'PPR' },
  { name: 'Tuna Melts', abbr: 'MLT' },
  { name: 'Maple Syrups', abbr: 'SYR' },
  { name: 'Olive Oilers', abbr: 'OIL' },
  { name: 'Bruins-My-Shins', abbr: 'SHN' },
  { name: 'Park Rangers', abbr: 'PRK' },
  { name: 'Golden Retrievers', abbr: 'RET' },
  { name: 'Snowflakes', abbr: 'SNW' },
  { name: 'Filibusters', abbr: 'FIL' },
  { name: 'Poutineers', abbr: 'PTN' },
  { name: 'Sparklers', abbr: 'SPK' },
  { name: 'Sea Cucumbers', abbr: 'CUC' },
  { name: 'Dad Jokes FC', abbr: 'DAD' },
  { name: 'Liver-and-Onions FC', abbr: 'ONI' },
  { name: 'Boots FC', abbr: 'BTS' },
  { name: 'Traffic Jams', abbr: 'JAM' },
  { name: 'Hotspuds', abbr: 'SPD' },
  { name: 'Untied Shoelaces', abbr: 'LAC' },
  { name: 'Vanilla Ice Creams', abbr: 'VAN' },
  { name: 'Bouncy Castles', abbr: 'BNC' },
];

const TEAM_COLORS = [
  '#007A33', '#552583', '#0E2240', '#00538C', '#1D1160', '#1D428A',
  '#98002E', '#006BB6', '#007AC1', '#00471B', '#5D76A9', '#0C2340',
  '#00338D', '#E31837', '#0076B6', '#AA0000', '#FB4F14', '#241773',
  '#003594', '#004C54', '#203731', '#125740', '#008E97', '#00205B',
  '#FF4C00', '#FFB81C', '#0038A8', '#B4975A', '#6F263D', '#C52032',
  '#AF1E2D', '#D2001C', '#EF0107', '#034694', '#6CABDD', '#DA291C',
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const GAME_SLOTS: {
  id: string;
  league: SportLeague;
  status: 'LIVE' | 'UPCOMING';
  clock: string;
  homeScore: number;
  awayScore: number;
  totalPointsLine: number;
  startTime: string;
}[] = [
  { id: 'game-01', league: 'NBA', status: 'LIVE', clock: 'Q4 03:42', homeScore: 108, awayScore: 105, totalPointsLine: 224.5, startTime: 'Live Now' },
  { id: 'game-02', league: 'NFL', status: 'LIVE', clock: 'Q3 08:15', homeScore: 21, awayScore: 24, totalPointsLine: 48.5, startTime: 'Live Now' },
  { id: 'game-03', league: 'NHL', status: 'LIVE', clock: 'P3 05:19', homeScore: 3, awayScore: 3, totalPointsLine: 6.5, startTime: 'Live Now' },
  { id: 'game-04', league: 'Premier League', status: 'LIVE', clock: "78'", homeScore: 2, awayScore: 1, totalPointsLine: 3.5, startTime: 'Live Now' },
  { id: 'game-05', league: 'NBA', status: 'UPCOMING', clock: 'Tipoff 8:30 PM', homeScore: 0, awayScore: 0, totalPointsLine: 231.0, startTime: 'Tonight, 8:30 PM' },
  { id: 'game-06', league: 'NFL', status: 'UPCOMING', clock: 'Kickoff 4:25 PM', homeScore: 0, awayScore: 0, totalPointsLine: 51.0, startTime: 'Tomorrow, 4:25 PM' },
  { id: 'game-07', league: 'NBA', status: 'LIVE', clock: 'Q3 06:11', homeScore: 82, awayScore: 86, totalPointsLine: 234.5, startTime: 'Live Now' },
  { id: 'game-08', league: 'NBA', status: 'LIVE', clock: 'Q2 01:48', homeScore: 54, awayScore: 59, totalPointsLine: 214.0, startTime: 'Live Now' },
  { id: 'game-09', league: 'NBA', status: 'UPCOMING', clock: 'Tipoff 9:00 PM', homeScore: 0, awayScore: 0, totalPointsLine: 229.5, startTime: 'Tonight, 9:00 PM' },
  { id: 'game-10', league: 'NBA', status: 'UPCOMING', clock: 'Tipoff 10:00 PM', homeScore: 0, awayScore: 0, totalPointsLine: 219.5, startTime: 'Tonight, 10:00 PM' },
  { id: 'game-11', league: 'NFL', status: 'LIVE', clock: 'Q4 04:50', homeScore: 27, awayScore: 31, totalPointsLine: 52.5, startTime: 'Live Now' },
  { id: 'game-12', league: 'NFL', status: 'UPCOMING', clock: 'Kickoff 8:20 PM', homeScore: 0, awayScore: 0, totalPointsLine: 47.0, startTime: 'Tonight, 8:20 PM' },
  { id: 'game-13', league: 'NFL', status: 'UPCOMING', clock: 'Kickoff 1:00 PM', homeScore: 0, awayScore: 0, totalPointsLine: 44.5, startTime: 'Sunday, 1:00 PM' },
  { id: 'game-14', league: 'NFL', status: 'UPCOMING', clock: 'Kickoff 1:00 PM', homeScore: 0, awayScore: 0, totalPointsLine: 45.5, startTime: 'Sunday, 1:00 PM' },
  { id: 'game-15', league: 'NHL', status: 'LIVE', clock: 'P2 11:04', homeScore: 2, awayScore: 1, totalPointsLine: 5.5, startTime: 'Live Now' },
  { id: 'game-16', league: 'NHL', status: 'UPCOMING', clock: 'Puck Drop 9:30 PM', homeScore: 0, awayScore: 0, totalPointsLine: 6.5, startTime: 'Tonight, 9:30 PM' },
  { id: 'game-17', league: 'NHL', status: 'UPCOMING', clock: 'Puck Drop 7:00 PM', homeScore: 0, awayScore: 0, totalPointsLine: 6.0, startTime: 'Tomorrow, 7:00 PM' },
  { id: 'game-18', league: 'NHL', status: 'UPCOMING', clock: 'Puck Drop 10:00 PM', homeScore: 0, awayScore: 0, totalPointsLine: 6.0, startTime: 'Tomorrow, 10:00 PM' },
  { id: 'game-19', league: 'Premier League', status: 'LIVE', clock: "62'", homeScore: 1, awayScore: 2, totalPointsLine: 3.5, startTime: 'Live Now' },
  { id: 'game-20', league: 'Premier League', status: 'UPCOMING', clock: 'Kickoff 11:30 AM', homeScore: 0, awayScore: 0, totalPointsLine: 3.0, startTime: 'Saturday, 11:30 AM' },
  { id: 'game-21', league: 'Premier League', status: 'UPCOMING', clock: 'Kickoff 9:00 AM', homeScore: 0, awayScore: 0, totalPointsLine: 2.5, startTime: 'Sunday, 9:00 AM' },
];

export function generateMockGames(): Game[] {
  const cities = shuffle(CITIES);
  const mascots = shuffle(PUNNY_MASCOTS);
  const colors = shuffle(TEAM_COLORS);

  return GAME_SLOTS.map((slot, idx) => {
    const homeIdx = idx * 2;
    const awayIdx = idx * 2 + 1;

    const homeMascot = mascots[homeIdx % mascots.length];
    const awayMascot = mascots[awayIdx % mascots.length];

    return {
      id: slot.id,
      league: slot.league,
      status: slot.status,
      clock: slot.clock,
      homeTeam: {
        name: `${cities[homeIdx % cities.length]} ${homeMascot.name}`,
        abbr: homeMascot.abbr,
        score: slot.homeScore,
        color: colors[homeIdx % colors.length],
      },
      awayTeam: {
        name: `${cities[awayIdx % cities.length]} ${awayMascot.name}`,
        abbr: awayMascot.abbr,
        score: slot.awayScore,
        color: colors[awayIdx % colors.length],
      },
      totalPointsLine: slot.totalPointsLine,
      startTime: slot.startTime,
    };
  });
}
