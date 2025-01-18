import {
  getUserTitles,
  getTitleTrophies,
  getUserPlayedGames,
  getUserTrophiesEarnedForTitle,
  Trophy,
  TrophyRarity,
} from "psn-api";
import { Game, GameHours, NormalizedTrophy } from "@/types/interfaces";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase";

export const fetchGamingHours = async (
  accessToken: string,
  userId: string
): Promise<GameHours[]> => {
  const response = await getUserPlayedGames({ accessToken }, userId);
  // Map the UserPlayedGamesResponse to an array of Game objects
  return response.titles.map((title) => ({
    titleName: title.name,
    titleId: title.titleId,
    playDuration: title.playDuration,
  }));
};

export const filterTrophiesByGameId = (
  games: Game[],
  gameId: string
): { bronze: number; silver: number; gold: number; platinum: number } => {
  // Find the game by the given gameId
  const game = games.find((g) => g.gameId === gameId);

  if (!game) {
    throw new Error(`Game with ID ${gameId} not found.`);
  }

  return game.earnedCounts;
};

export const fetchTrophies = async (
  accessToken: string,
  userId: string
): Promise<Game[]> => {
  const response = await getUserTitles({ accessToken }, userId);

  const games: Game[] = [];
  if (response?.trophyTitles) {
    for (const title of response?.trophyTitles) {
      const { trophies: titleTrophies } = await getTitleTrophies(
        { accessToken },
        title.npCommunicationId,
        "all",
        {
          npServiceName:
            title.trophyTitlePlatform !== "PS5" ? "trophy" : "trophy2",
        }
      );

      const { trophies: earnedTrophies } = await getUserTrophiesEarnedForTitle(
        { accessToken },
        userId,
        title.npCommunicationId,
        "all",
        {
          npServiceName:
            title.trophyTitlePlatform !== "PS5" ? "trophy" : "trophy2",
        }
      );

      const mergedTrophies = mergeTrophyLists(
        titleTrophies,
        earnedTrophies.filter((trophy) => trophy.earned === true)
      );

      games.push({
        gameName: title.trophyTitleName,
        gameId: title.npCommunicationId,
        platform: title.trophyTitlePlatform,
        trophyTypeCounts: title.definedTrophies,
        earnedCounts: title.earnedTrophies,
        trophyList: mergedTrophies,
      });
    }
  }

  // Upload to Firestore
  await uploadTrophiesToFirestore(userId, games);

  return games;
};

const uploadTrophiesToFirestore = async (userId: string, games: Game[]) => {
  try {
    const trophiesDocRef = db.collection("trophies").doc(userId);
    const docSnapshot = await trophiesDocRef.get();

    const now = Timestamp.now();

    // Check if the document exists and was updated within the last day
    if (docSnapshot.exists) {
      const lastUpdated = docSnapshot.data()?.lastUpdated?.toDate();
      const oneDayInMillis = 24 * 60 * 60 * 1000;

      if (
        lastUpdated &&
        now.toMillis() - lastUpdated.getTime() < oneDayInMillis
      ) {
        console.log(`Trophies for user ${userId} are already up-to-date.`);
        return; // Do not update if less than 24 hours have passed
      }
    }

    // Save the new trophies data along with a `lastUpdated` timestamp
    await trophiesDocRef.set({
      userId,
      games,
      lastUpdated: now,
    });

    console.log(`Trophies for user ${userId} updated successfully.`);
  } catch (error) {
    console.error(`Error uploading trophies for user ${userId}:`, error);
  }
};

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: NormalizedTrophy[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  return mergedTrophies;
};

const normalizeTrophy = (trophy: Trophy) => {
  return {
    isEarned: trophy.earned ?? false,
    earnedOn: trophy.earned ? trophy.earnedDateTime : "unearned",
    type: trophy.trophyType,
    rarity: rarityMap[trophy.trophyRare ?? 0],
    earnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    groupId: trophy.trophyGroupId,
  };
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};
