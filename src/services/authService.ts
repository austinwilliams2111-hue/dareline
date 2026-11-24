import {
  getSessionUid,
  multiplayerStore,
  setSessionUid,
} from '../lib/multiplayerStore';
import { UserProfile } from '../types';

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-amber-600',
];

export const authService = {
  async joinOrSwitchPlayer(username: string): Promise<UserProfile> {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 2) {
      throw new Error('Pick a player handle with at least 2 letters or numbers.');
    }

    const allUsers = await multiplayerStore.fetchAllUsers();
    const existing = allUsers.find((u) => u.username === cleanUsername);

    if (existing) {
      setSessionUid(existing.uid);
      return existing;
    }

    const newProfile: UserProfile = {
      uid: `player-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      daresKept: 0,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      createdAt: Date.now(),
    };

    const saved = await multiplayerStore.upsertUser(newProfile);
    setSessionUid(saved.uid);
    return saved;
  },

  async restoreSession(): Promise<UserProfile | null> {
    const uid = getSessionUid();
    if (!uid) return null;
    const allUsers = await multiplayerStore.fetchAllUsers();
    return allUsers.find((u) => u.uid === uid) || null;
  },

  async listExistingPlayers(): Promise<UserProfile[]> {
    return multiplayerStore.fetchAllUsers();
  },

  leaveSession(): void {
    setSessionUid(null);
  },
};
