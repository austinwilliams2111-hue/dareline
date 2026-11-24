import React, { useEffect, useState } from 'react';
import { Award, Check, Copy, Search, UserPlus, Users, X } from 'lucide-react';
import { friendService } from '../services/friendService';
import { Friendship, UserProfile } from '../types';

interface FriendsViewProps {
  currentUser: UserProfile;
  friendships: Friendship[];
  onRefresh: () => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  friendships,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryPlayers, setDirectoryPlayers] = useState<UserProfile[]>([]);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    friendService
      .searchPlayers(searchQuery, currentUser.uid)
      .then(setDirectoryPlayers)
      .catch(() => {});
  }, [searchQuery, currentUser.uid, friendships]);

  const incomingRequests = friendships.filter(
    (f) => f.status === 'pending' && f.recipientId === currentUser.uid
  );
  const outgoingRequests = friendships.filter(
    (f) => f.status === 'pending' && f.requesterId === currentUser.uid
  );
  const acceptedFriends = friendships.filter((f) => f.status === 'accepted');

  const inviteLink = `${window.location.origin}/?invite=${currentUser.username}`;

  const handleAddFriend = async (target: UserProfile) => {
    setFeedback('');
    try {
      await friendService.sendFriendRequest(currentUser, target);
      setFeedback(`Friend request sent to @${target.username}!`);
      onRefresh();
    } catch (err: any) {
      setFeedback(err.message);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    await friendService.acceptFriendRequest(friendshipId);
    onRefresh();
  };

  const handleDeclineOrRemove = async (friendshipId: string) => {
    await friendService.declineOrRemoveFriend(friendshipId);
    onRefresh();
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header & Shareable Invite Link */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Friends & Rivals</h1>
          <p className="mt-1 text-sm text-slate-400">
            Add other players by handle or share your link so they can join and accept your requests.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2">
          <code className="max-w-[210px] truncate px-2 text-xs text-emerald-400 sm:max-w-xs">
            {inviteLink}
          </code>
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Invite'}</span>
          </button>
        </div>
      </div>

      {/* Incoming Friend Requests */}
      {incomingRequests.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-400">
            Incoming Friend Requests ({incomingRequests.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {req.requesterUsername.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">
                      @{req.requesterUsername}
                    </span>
                    <p className="text-xs text-slate-400">Wants to be rivals</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handleDeclineOrRemove(req.id)}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Directory & Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
            <Users className="h-4 w-4 text-emerald-400" /> Player Lobby Directory
          </h2>
          <span className="text-xs text-slate-500">
            {directoryPlayers.length} players available
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search player handle..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {feedback && <p className="mt-3 text-xs font-medium text-emerald-400">{feedback}</p>}

        {directoryPlayers.length === 0 ? (
          <p className="mt-4 text-xs text-slate-400">
            No matching players found. Have your friend open Dareline and enter a handle!
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {directoryPlayers.map((user) => {
              const connection = friendships.find(
                (f) => f.requesterId === user.uid || f.recipientId === user.uid
              );

              return (
                <div
                  key={user.uid}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${user.avatarColor}`}
                    >
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">@{user.username}</p>
                      <p className="text-xs text-slate-400">{user.daresKept} Dares Kept</p>
                    </div>
                  </div>

                  {connection?.status === 'accepted' ? (
                    <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400">
                      Friends ✓
                    </span>
                  ) : connection?.status === 'pending' ? (
                    <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400">
                      Pending...
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddFriend(user)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Add Friend
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Sent Requests ({outgoingRequests.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {outgoingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"
              >
                <span>Waiting on @{req.recipientUsername}</span>
                <button
                  onClick={() => handleDeclineOrRemove(req.id)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Friends List */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
          Your Friends ({acceptedFriends.length})
        </h2>
        {acceptedFriends.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
            No friends added yet. Add a player from the directory above!
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {acceptedFriends.map((f) => {
              const friendUsername =
                f.requesterId === currentUser.uid ? f.recipientUsername : f.requesterUsername;
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {friendUsername.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">@{friendUsername}</p>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <Award className="h-3 w-3" /> Active Rival
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeclineOrRemove(f.id)}
                    title="Remove friend"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
