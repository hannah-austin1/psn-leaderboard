import { TrophyType } from "psn-api";

export interface AuthTokensResponse {
  /** Used to retrieve data from the PSN API. */
  access_token: string;

  /** When the access token will expire. */
  expires_in: number;

  id_token: string;

  /** Used to retrieve a new access token when it expires. */
  refresh_token: string;

  /** When the refresh token will expire. */
  refresh_token_expires_in: number;

  scope: string;
  token_type: string;
}

export interface GameHours {
  titleName: string;
  titleId: string;
  playDuration: string;
}

export interface Game {
  gameName: string;
  gameId: string;
  platform: string;
  trophyTypeCounts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  earnedCounts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  trophyList: NormalizedTrophy[];
}

export interface NormalizedTrophy {
  isEarned: boolean;
  earnedOn: string | undefined;
  type: TrophyType;
  rarity: string;
  earnedRate: number;
  trophyName: string | undefined;
  groupId: string | undefined;
}

export interface User {
  name: string;
  id: string;
  hours: number;
}

export interface AccessTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Time in seconds until the access token expires
  refreshTokenExpiresIn?: number; // Optional: Time in seconds until the refresh token expires
}
