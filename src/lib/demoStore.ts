import { Dare, Friendship, UserProfile } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'dareline_demo_current_user_v1',
  USERS: 'dareline_demo_users_v1',
  FRIENDSHIPS: 'dareline_demo_friendships_v1',
  DARES: 'dareline_demo_dares_v1',
};

const SEED_USERS: UserProfile[] = [
  {
    uid: 'user-maya',
    username: 'maya_hoops',
    daresKept: 7,
    avatarColor: 'bg-teal-600',
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    uid: 'user-liam',
    username: 'liam_puck',
    daresKept: 5,
    avatarColor: 'bg-indigo-600',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    uid: 'user-chloe',
    username: 'chloe_fc',
    daresKept: 9,
    avatarColor: 'bg-violet-600',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    uid: 'user-marcus',
    username: 'marcus_gridiron',
    daresKept: 3,
    avatarColor: 'bg-amber-600',
    createdAt: Date.now() - 86400000 * 5,
  },
];

export function initializeDemoSeed(currentUser: UserProfile) {
  const existingUsers = getStoredUsers();
  if (existingUsers.length === 0) {
    saveStoredUsers([currentUser, ...SEED_USERS]);
  } else if (!existingUsers.some((u) => u.uid === currentUser.uid)) {
    saveStoredUsers([currentUser, ...existingUsers]);
  }

  if (!localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) {
    const initialFriendships: Friendship[] = [
      {
        id: 'fr-1',
        requesterId: currentUser.uid,
        requesterUsername: currentUser.username,
        recipientId: 'user-maya',
        recipientUsername: 'maya_hoops',
        status: 'accepted',
        createdAt: Date.now() - 3600000 * 5,
      },
      {
        id: 'fr-2',
        requesterId: currentUser.uid,
        requesterUsername: currentUser.username,
        recipientId: 'user-liam',
        recipientUsername: 'liam_puck',
        status: 'accepted',
        createdAt: Date.now() - 3600000 * 4,
      },
      {
        id: 'fr-3',
        requesterId: 'user-chloe',
        requesterUsername: 'chloe_fc',
        recipientId: currentUser.uid,
        recipientUsername: currentUser.username,
        status: 'pending',
        createdAt: Date.now() - 3600000 * 1,
      },
    ];
    saveStoredFriendships(initialFriendships);
  }

  if (!localStorage.getItem(STORAGE_KEYS.DARES)) {
    const initialDares: Dare[] = [
      {
        id: 'dare-1',
        gameId: 'nba-bos-lal-01',
        gameTitle: 'LAL @ BOS',
        league: 'NBA',
        challengerId: 'user-maya',
        challengerUsername: 'maya_hoops',
        opponentId: currentUser.uid,
        opponentUsername: currentUser.username,
        conditionLabel: 'Matchup Winner',
        challengerSide: 'Los Angeles Lakers Wins',
        opponentSide: 'Boston Celtics Wins',
        dareText: 'Loser wears the rival team’s jersey or colors for a full day',
        status: 'pending',
        createdAt: Date.now() - 1800000,
        updatedAt: Date.now() - 1800000,
      },
      {
        id: 'dare-2',
        gameId: 'nhl-tor-edm-03',
        gameTitle: 'EDM @ TOR',
        league: 'NHL',
        challengerId: currentUser.uid,
        challengerUsername: currentUser.username,
        opponentId: 'user-liam',
        opponentUsername: 'liam_puck',
        conditionLabel: 'Over/Under 6.5',
        challengerSide: 'Over 6.5 Total Points',
        opponentSide: 'Under 6.5 Total Points',
        dareText: 'Loser buys the winner iced coffee before the next game',
        status: 'active',
        createdAt: Date.now() - 5400000,
        updatedAt: Date.now() - 3600000,
      },
    ];
    saveStoredDares(initialDares);
  }
}

export function getCurrentUser(): UserProfile | null {
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export function setCurrentUser(user: UserProfile | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

export function getStoredUsers(): UserProfile[] {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? (JSON.parse(raw) as UserProfile[]) : [];
}

export function saveStoredUsers(users: UserProfile[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getStoredFriendships(): Friendship[] {
  const raw = localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS);
  return raw ? (JSON.parse(raw) as Friendship[]) : [];
}

export function saveStoredFriendships(friendships: Friendship[]) {
  localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(friendships));
}

export function getStoredDares(): Dare[] {
  const raw = localStorage.getItem(STORAGE_KEYS.DARES);
  return raw ? (JSON.parse(raw) as Dare[]) : [];
}

export function saveStoredDares(dares: Dare[]) {
  localStorage.setItem(STORAGE_KEYS.DARES, JSON.stringify(dares));
}

export function resetAllDemoData() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}
