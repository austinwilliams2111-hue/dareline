export type SportLeague = 'NBA' | 'NFL' | 'NHL' | 'Premier League';

export interface UserProfile {
  uid: string;
  username: string;
  daresKept: number;
  avatarColor: string;
  createdAt: number;
}

export interface Friendship {
  id: string;
  requesterId: string;
  requesterUsername: string;
  recipientId: string;
  recipientUsername: string;
  status: 'pending' | 'accepted';
  createdAt: number;
}

export interface Game {
  id: string;
  league: SportLeague;
  status: 'LIVE' | 'UPCOMING' | 'FINAL';
  clock: string;
  homeTeam: { name: string; abbr: string; score: number; color: string };
  awayTeam: { name: string; abbr: string; score: number; color: string };
  totalPointsLine: number;
  startTime: string;
}

export type DareStatus =
  | 'pending'
  | 'active'
  | 'proof_submitted'
  | 'completed'
  | 'declined';

export interface Dare {
  id: string;
  gameId: string;
  gameTitle: string;
  league: SportLeague;
  challengerId: string;
  challengerUsername: string;
  opponentId: string;
  opponentUsername: string;
  conditionLabel: string;
  challengerSide: string;
  opponentSide: string;
  dareText: string;
  status: DareStatus;
  winnerId?: string;
  winnerUsername?: string;
  loserId?: string;
  loserUsername?: string;
  proofText?: string;
  proofImageUrl?: string;
  badgeAwarded?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  flaggedTerm?: string;
}
