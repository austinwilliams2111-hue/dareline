import { multiplayerStore } from '../lib/multiplayerStore';
import { Friendship, UserProfile } from '../types';

export const friendService = {
  async searchPlayers(searchTerm: string, currentUid: string): Promise<UserProfile[]> {
    const clean = searchTerm.trim().toLowerCase();
    const all = await multiplayerStore.fetchAllUsers();
    const others = all.filter((u) => u.uid !== currentUid);
    if (!clean) return others;
    return others.filter((u) => u.username.includes(clean));
  },

  async sendFriendRequest(requester: UserProfile, recipient: UserProfile): Promise<void> {
    if (requester.uid === recipient.uid) {
      throw new Error('You cannot add yourself as a friend.');
    }

    const existing = await multiplayerStore.fetchFriendships(requester.uid);
    const alreadyExists = existing.some(
      (f) =>
        (f.requesterId === requester.uid && f.recipientId === recipient.uid) ||
        (f.requesterId === recipient.uid && f.recipientId === requester.uid)
    );

    if (alreadyExists) {
      throw new Error('A friend request or connection already exists with this player.');
    }

    const newFriendship: Friendship = {
      id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      requesterId: requester.uid,
      requesterUsername: requester.username,
      recipientId: recipient.uid,
      recipientUsername: recipient.username,
      status: 'pending',
      createdAt: Date.now(),
    };

    await multiplayerStore.createFriendship(newFriendship);
  },

  async acceptFriendRequest(friendshipId: string): Promise<void> {
    await multiplayerStore.updateFriendshipStatus(friendshipId, 'accepted');
  },

  async declineOrRemoveFriend(friendshipId: string): Promise<void> {
    await multiplayerStore.deleteFriendship(friendshipId);
  },
};
