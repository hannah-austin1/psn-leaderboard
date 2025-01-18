import { GameHours } from "@/types/interfaces";

const parseDurationToMinutes = (duration: string): number => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = duration.match(regex);

  if (!match) {
    throw new Error("Invalid duration format");
  }

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);

  // Convert everything to minutes
  return hours + Math.floor(minutes / 60);
};

export const getHours = (games: Array<GameHours>, titleId: string) => {
  const gameData = games.find((game: GameHours) => game.titleId === titleId);
  return gameData?.playDuration
    ? parseDurationToMinutes(gameData.playDuration)
    : 0;
};
