import {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  exchangeRefreshTokenForAuthTokens,
} from "psn-api";
import { db } from "./firebase";

const TOKEN_COLLECTION = "tokens";
const NPSSO_DOC_ID = "psn_npsso";
const TOKEN_DOC_ID = "psn_token";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp for when the token expires
}

// Retrieve the NPSSO token from Firestore
const getNpssoToken = async (): Promise<string> => {
  const docRef = db.collection(TOKEN_COLLECTION).doc(NPSSO_DOC_ID);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("NPSSO token is not set in Firestore.");
  }
  const data = doc.data();
  if (!data?.npsso) {
    throw new Error("NPSSO token is missing in Firestore.");
  }
  return data.npsso as string;
};

// Save tokens to Firestore
const saveTokens = async (tokens: TokenData): Promise<void> => {
  const docRef = db.collection(TOKEN_COLLECTION).doc(TOKEN_DOC_ID);
  await docRef.set(tokens);
};

// Read tokens from Firestore
const readTokens = async (): Promise<TokenData | null> => {
  const docRef = db.collection(TOKEN_COLLECTION).doc(TOKEN_DOC_ID);
  const doc = await docRef.get();
  return doc.exists ? (doc.data() as TokenData) : null;
};

// Exchange NPSSO for new tokens and save them
const exchangeNpssoForTokens = async (): Promise<TokenData> => {
  const npsso = await getNpssoToken();
  const accessCode = await exchangeNpssoForCode(npsso);
  const newTokens = await exchangeCodeForAccessToken(accessCode);
  const tokenData: TokenData = {
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
    expiresAt: Date.now() + newTokens.expiresIn * 1000,
  };
  await saveTokens(tokenData);
  return tokenData;
};

// Get or refresh the access token
export const getAccessToken = async (): Promise<string> => {
  const tokens = await readTokens();

  console.log(tokens?.expiresAt, Date.now());

  // If access token is valid, return it
  //   if (tokens && tokens.expiresAt > Date.now()) {
  //     return tokens.accessToken;
  //   }

  // If refresh token exists, refresh the access token
  if (tokens?.refreshToken) {
    try {
      const refreshedTokens = await exchangeRefreshTokenForAuthTokens(
        tokens.refreshToken
      );
      const updatedTokens: TokenData = {
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
        expiresAt: Date.now() + refreshedTokens.expiresIn * 1000,
      };
      await saveTokens(updatedTokens);
      return updatedTokens.accessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  // If no valid tokens exist, use NPSSO to generate new tokens
  return (await exchangeNpssoForTokens()).accessToken;
};
