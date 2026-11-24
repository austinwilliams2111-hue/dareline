import { Dare, Friendship, UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

const KEYS = {
  SESSION_USER_ID: 'dareline_mp_session_uid_v2',
  USERS: 'dareline_mp_users_v2',
  FRIENDSHIPS: 'dareline_mp_friendships_v2',
  DARES: 'dareline_mp_dares_v2',
};

const SEED_BOTS: UserProfile[] = [
  {
    uid: 'bot-maya',
    username: 'maya_hoops',
    daresKept: 7,
    avatarColor: 'bg-teal-600',
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    uid: 'bot-liam',
    username: 'liam_puck',
    daresKept: 5,
    avatarColor: 'bg-indigo-600',
    createdAt: Date.now() - 86400000 * 10,
  },
];

// BroadcastChannel syncs changes across multiple browser tabs immediately
const channel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('dareline_multiplayer_sync')
    : null;

function notifyLocalChange() {
  channel?.postMessage({ type: 'SYNC', ts: Date.now() });
  window.dispatchEvent(new Event('dareline_sync'));
}

export function getSessionUid(): string | null {
  return sessionStorage.getItem(KEYS.SESSION_USER_ID);
}

export function setSessionUid(uid: string | null) {
  if (!uid) {
    sessionStorage.removeItem(KEYS.SESSION_USER_ID);
  } else {
    sessionStorage.setItem(KEYS.SESSION_USER_ID, uid);
  }
}

function readLocal<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  notifyLocalChange();
}

export function ensureLocalSeed() {
  const users = readLocal<UserProfile[]>(KEYS.USERS, []);
  if (users.length === 0) {
    writeLocal(KEYS.USERS, SEED_BOTS);
  }
}

// --- Mapping helpers for Supabase snake_case <-> TypeScript camelCase ---
function mapProfileFromDb(row: any): UserProfile {
  return {
    uid: row.uid,
    username: row.username,
    daresKept: row.dares_kept ?? 0,
    avatarColor: row.avatar_color ?? 'bg-emerald-600',
    createdAt: Number(row.created_at ?? Date.now()),
  };
}

function mapFriendshipFromDb(row: any): Friendship {
  return {
    id: row.id,
    requesterId: row.requester_id,
    requesterUsername: row.requester_username,
    recipientId: row.recipient_id,
    recipientUsername: row.recipient_username,
    status: row.status,
    createdAt: Number(row.created_at ?? Date.now()),
  };
}

function mapDareFromDb(row: any): Dare {
  return {
    id: row.id,
    gameId: row.game_id,
    gameTitle: row.game_title,
    league: row.league,
    challengerId: row.challenger_id,
    challengerUsername: row.challenger_username,
    opponentId: row.opponent_id,
    opponentUsername: row.opponent_username,
    conditionLabel: row.condition_label,
    challengerSide: row.challenger_side,
    opponentSide: row.opponent_side,
    dareText: row.dare_text,
    status: row.status,
    loserId: row.loser_id || undefined,
    loserUsername: row.loser_username || undefined,
    winnerId: row.winner_id || undefined,
    winnerUsername: row.winner_username || undefined,
    proofText: row.proof_text || undefined,
    proofImageUrl: row.proof_image_url || undefined,
    badgeAwarded: Boolean(row.badge_awarded),
    createdAt: Number(row.created_at ?? Date.now()),
    updatedAt: Number(row.updated_at ?? Date.now()),
  };
}

export const multiplayerStore = {
  async fetchAllUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(mapProfileFromDb);
    }
    ensureLocalSeed();
    return readLocal<UserProfile[]>(KEYS.USERS, []);
  },

  async upsertUser(profile: UserProfile): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            uid: profile.uid,
            username: profile.username,
            dares_kept: profile.daresKept,
            avatar_color: profile.avatarColor,
            created_at: profile.createdAt,
          },
          { onConflict: 'username' }
        )
        .select()
        .single();
      if (error) throw new Error(error.message);
      return mapProfileFromDb(data);
    }

    ensureLocalSeed();
    const users = readLocal<UserProfile[]>(KEYS.USERS, []);
    const existing = users.find((u) => u.username === profile.username);
    if (existing) return existing;

    const updated = [profile, ...users];
    writeLocal(KEYS.USERS, updated);
    return profile;
  },

  async incrementDaresKept(uid: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('dares_kept')
        .eq('uid', uid)
        .single();
      const nextCount = (data?.dares_kept ?? 0) + 1;
      await supabase
        .from('profiles')
        .update({ dares_kept: nextCount })
        .eq('uid', uid);
      return;
    }

    const users = readLocal<UserProfile[]>(KEYS.USERS, []);
    const updated = users.map((u) =>
      u.uid === uid ? { ...u, daresKept: u.daresKept + 1 } : u
    );
    writeLocal(KEYS.USERS, updated);
  },

  async fetchFriendships(uid: string): Promise<Friendship[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(mapFriendshipFromDb);
    }

    const all = readLocal<Friendship[]>(KEYS.FRIENDSHIPS, []);
    return all.filter((f) => f.requesterId === uid || f.recipientId === uid);
  },

  async createFriendship(f: Friendship): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('friendships').insert({
        id: f.id,
        requester_id: f.requesterId,
        requester_username: f.requesterUsername,
        recipient_id: f.recipientId,
        recipient_username: f.recipientUsername,
        status: f.status,
        created_at: f.createdAt,
      });
      if (error) throw new Error(error.message);
      return;
    }

    const all = readLocal<Friendship[]>(KEYS.FRIENDSHIPS, []);
    writeLocal(KEYS.FRIENDSHIPS, [f, ...all]);
  },

  async updateFriendshipStatus(id: string, status: 'accepted'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const all = readLocal<Friendship[]>(KEYS.FRIENDSHIPS, []);
    writeLocal(
      KEYS.FRIENDSHIPS,
      all.map((f) => (f.id === id ? { ...f, status } : f))
    );
  },

  async deleteFriendship(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('friendships').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const all = readLocal<Friendship[]>(KEYS.FRIENDSHIPS, []);
    writeLocal(
      KEYS.FRIENDSHIPS,
      all.filter((f) => f.id !== id)
    );
  },

  async fetchDares(uid: string): Promise<Dare[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('dares')
        .select('*')
        .or(`challenger_id.eq.${uid},opponent_id.eq.${uid}`)
        .order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(mapDareFromDb);
    }

    const all = readLocal<Dare[]>(KEYS.DARES, []);
    return all
      .filter((d) => d.challengerId === uid || d.opponentId === uid)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async insertDare(d: Dare): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('dares').insert({
        id: d.id,
        game_id: d.gameId,
        game_title: d.gameTitle,
        league: d.league,
        challenger_id: d.challengerId,
        challenger_username: d.challengerUsername,
        opponent_id: d.opponentId,
        opponent_username: d.opponentUsername,
        condition_label: d.conditionLabel,
        challenger_side: d.challengerSide,
        opponent_side: d.opponentSide,
        dare_text: d.dareText,
        status: d.status,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
      });
      if (error) throw new Error(error.message);
      return;
    }

    const all = readLocal<Dare[]>(KEYS.DARES, []);
    writeLocal(KEYS.DARES, [d, ...all]);
  },

  async updateDare(id: string, patch: Partial<Dare>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const dbPatch: Record<string, any> = { updated_at: Date.now() };
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.challengerId !== undefined) dbPatch.challenger_id = patch.challengerId;
      if (patch.challengerUsername !== undefined)
        dbPatch.challenger_username = patch.challengerUsername;
      if (patch.opponentId !== undefined) dbPatch.opponent_id = patch.opponentId;
      if (patch.opponentUsername !== undefined)
        dbPatch.opponent_username = patch.opponentUsername;
      if (patch.challengerSide !== undefined)
        dbPatch.challenger_side = patch.challengerSide;
      if (patch.opponentSide !== undefined) dbPatch.opponent_side = patch.opponentSide;
      if (patch.dareText !== undefined) dbPatch.dare_text = patch.dareText;
      if (patch.loserId !== undefined) dbPatch.loser_id = patch.loserId;
      if (patch.loserUsername !== undefined)
        dbPatch.loser_username = patch.loserUsername;
      if (patch.winnerId !== undefined) dbPatch.winner_id = patch.winnerId;
      if (patch.winnerUsername !== undefined)
        dbPatch.winner_username = patch.winnerUsername;
      if (patch.proofText !== undefined) dbPatch.proof_text = patch.proofText;
      if (patch.proofImageUrl !== undefined)
        dbPatch.proof_image_url = patch.proofImageUrl;
      if (patch.badgeAwarded !== undefined)
        dbPatch.badge_awarded = patch.badgeAwarded;

      const { error } = await supabase.from('dares').update(dbPatch).eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const all = readLocal<Dare[]>(KEYS.DARES, []);
    writeLocal(
      KEYS.DARES,
      all.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d
      )
    );
  },

  subscribeToChanges(onSync: () => void): () => void {
    if (isSupabaseConfigured && supabase) {
      const sub = supabase
        .channel('dareline-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          onSync
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'friendships' },
          onSync
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'dares' },
          onSync
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(sub);
      };
    }

    const handleMsg = () => onSync();
    channel?.addEventListener('message', handleMsg);
    window.addEventListener('storage', handleMsg);
    window.addEventListener('dareline_sync', handleMsg);

    return () => {
      channel?.removeEventListener('message', handleMsg);
      window.removeEventListener('storage', handleMsg);
      window.removeEventListener('dareline_sync', handleMsg);
    };
  },
};
