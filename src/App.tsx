import React, { useCallback, useEffect, useState } from 'react';
import { CreateDareModal } from './components/CreateDareModal';
import { DaresDashboard } from './components/DaresDashboard';
import { FriendsView } from './components/FriendsView';
import { GameCard } from './components/GameCard';
import { ActiveTab, Navbar } from './components/Navbar';
import { PlayerLobbyScreen } from './components/PlayerLobbyScreen';
import { generateMockGames, simulateFinalScore } from './data/mockGames';
import { multiplayerStore } from './lib/multiplayerStore';
import { authService } from './services/authService';
import { fetchRealGames } from './services/espnService';
import { Dare, Friendship, Game, SportLeague, UserProfile } from './types';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('games');

  const [useRealData, setUseRealData] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);
  const [games, setGames] = useState<Game[]>(() => generateMockGames());
  const [selectedLeague, setSelectedLeague] = useState<'ALL' | SportLeague>('ALL');
  const [challengeGame, setChallengeGame] = useState<Game | null>(null);

  const [dares, setDares] = useState<Dare[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);

  const loadGames = useCallback(async () => {
    if (!useRealData) {
      setGames(generateMockGames());
      return;
    }
    setLoadingGames(true);
    try {
      const { games: fetched } = await fetchRealGames();
      setGames(fetched);
    } finally {
      setLoadingGames(false);
    }
  }, [useRealData]);

  // Fetch games on load, when toggling Live/Demo mode, and every 45s in Live ESPN mode
  useEffect(() => {
    loadGames();
    if (!useRealData) return;
    const interval = setInterval(loadGames, 45_000);
    return () => clearInterval(interval);
  }, [loadGames, useRealData]);

  const syncUserData = useCallback(async (uid: string) => {
    try {
      const [allUsers, userDares, userFriends] = await Promise.all([
        multiplayerStore.fetchAllUsers(),
        multiplayerStore.fetchDares(uid),
        multiplayerStore.fetchFriendships(uid),
      ]);
      const freshMe = allUsers.find((u) => u.uid === uid);
      if (freshMe) setUserProfile(freshMe);
      setDares(userDares);
      setFriendships(userFriends);
    } catch {
      // Ignore transient network errors during background sync
    }
  }, []);

  useEffect(() => {
    authService
      .restoreSession()
      .then((profile) => {
        if (profile) {
          setUserProfile(profile);
          syncUserData(profile.uid);
        }
      })
      .finally(() => setBooting(false));
  }, [syncUserData]);

  useEffect(() => {
    if (!userProfile) return;
    syncUserData(userProfile.uid);
    const unsubscribe = multiplayerStore.subscribeToChanges(() => {
      syncUserData(userProfile.uid);
    });
    return unsubscribe;
  }, [userProfile?.uid, syncUserData]);

  const handleJoined = (profile: UserProfile) => {
    setUserProfile(profile);
    loadGames();
    setSelectedLeague('ALL');
    syncUserData(profile.uid);
  };

  const handleSwitchPlayer = () => {
    authService.leaveSession();
    setUserProfile(null);
    loadGames();
    setSelectedLeague('ALL');
    setDares([]);
    setFriendships([]);
    setActiveTab('games');
  };

  const handleSimulateFinish = (gameId: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        const { homeScore, awayScore, clock } = simulateFinalScore(g);
        return {
          ...g,
          status: 'FINAL',
          clock,
          homeTeam: { ...g.homeTeam, score: homeScore },
          awayTeam: { ...g.awayTeam, score: awayScore },
        };
      })
    );
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-emerald-400">
        Loading Dareline...
      </div>
    );
  }

  if (!userProfile) {
    return <PlayerLobbyScreen onJoined={handleJoined} />;
  }

  const acceptedFriendsList = friendships
    .filter((f) => f.status === 'accepted')
    .map((f) =>
      f.requesterId === userProfile.uid
        ? { uid: f.recipientId, username: f.recipientUsername }
        : { uid: f.requesterId, username: f.requesterUsername }
    );

  const actionRequiredDaresCount = dares.filter(
    (d) =>
      (d.status === 'pending' && d.opponentId === userProfile.uid) ||
      (d.status === 'active' && d.loserId === userProfile.uid) ||
      (d.status === 'proof_submitted' && d.winnerId === userProfile.uid)
  ).length;

  const pendingFriendsCount = friendships.filter(
    (f) => f.status === 'pending' && f.recipientId === userProfile.uid
  ).length;

  const filteredGames =
    selectedLeague === 'ALL'
      ? games
      : games.filter((g) => g.league === selectedLeague);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={userProfile}
        actionRequiredDaresCount={actionRequiredDaresCount}
        pendingFriendsCount={pendingFriendsCount}
        onSwitchPlayer={handleSwitchPlayer}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Live & Upcoming Matchups
                  </h1>
                  <button
                    onClick={() => setUseRealData((prev) => !prev)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 transition ${
                      useRealData
                        ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-300 ring-amber-500/40 hover:bg-amber-500/25'
                    }`}
                  >
                    {useRealData
                      ? loadingGames
                        ? 'Syncing ESPN...'
                        : '● Live ESPN Feed'
                      : 'Demo Slate'}
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  Pick a game, call your shot, and stake a harmless creative dare.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['ALL', 'NBA', 'NFL', 'NHL', 'Premier League'] as const).map((lg) => (
                  <button
                    key={lg}
                    onClick={() => setSelectedLeague(lg)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedLeague === lg
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 ring-1 ring-slate-800 hover:text-white'
                    }`}
                  >
                    {lg}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onChallenge={(g) => setChallengeGame(g)}
                  onSimulateFinish={handleSimulateFinish}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dares' && (
          <DaresDashboard
            currentUser={userProfile}
            dares={dares}
            games={games}
            onRefresh={() => syncUserData(userProfile.uid)}
          />
        )}

        {activeTab === 'friends' && (
          <FriendsView
            currentUser={userProfile}
            friendships={friendships}
            onRefresh={() => syncUserData(userProfile.uid)}
          />
        )}
      </main>

      {challengeGame && (
        <CreateDareModal
          game={challengeGame}
          currentUser={userProfile}
          friends={acceptedFriendsList}
          onClose={() => setChallengeGame(null)}
          onDareCreated={() => syncUserData(userProfile.uid)}
          onNavigateToFriends={() => setActiveTab('friends')}
        />
      )}
    </div>
  );
}

export default App;