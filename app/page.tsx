import { getHours } from "@/lib/getHours";

import {
  fetchGamingHours,
  fetchTrophies,
  filterTrophiesByGameId,
} from "../lib/psnData";
import GameRadialBarChart from "./components/RadialBarChart";
import { getAccessToken } from "@/lib/psnAuth";
import { Game } from "@/types/interfaces";
import TrophiesDisplay from "@/components/ui/trophies";
import UserTrophiesBarChart from "./components/BarChart";

const users = [
  { name: "Hannah", id: "me" },
  { name: "Ed", id: "810414540496447833" },
  { name: "Luke", id: "825266258696957311" },
  { name: "Allie", id: "2523297459232363808" },
];

interface UserGamingData {
  name: string;
  hours: number;
  trophies?: Game[];
  trophyCounts?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

export default async function Home() {
  const accessToken = await getAccessToken();
  const userGames: UserGamingData[] = [];

  for (const user of users) {
    try {
      const games = await fetchGamingHours(accessToken, user.id);
      const trophies = await fetchTrophies(accessToken, user.id);
      const trophyCounts = trophies
        ? filterTrophiesByGameId(trophies, "NPWR25067_00") // Count trophies only for the given game
        : { bronze: 0, silver: 0, gold: 0, platinum: 0 };
      userGames.push({
        name: user.name,
        hours: getHours(games, "PPSA04609_00"),
        trophies,
        trophyCounts,
      });
    } catch (error) {
      console.error(`Error fetching gaming hours for user ${user.id}:`, error);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="text-center">
        <h1 className="text-4xl font-bold">Elden Ring Stats</h1>
      </header>

      {userGames.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          {/* Radial Bar Chart Section */}
          <section className="flex justify-center">
            <GameRadialBarChart
              data={userGames.map(({ name, hours }) => ({ name, hours }))}
              usersCount={users.length}
            />
          </section>

          {/* Trophies Section */}
          <section className="grid grid-cols-2 gap-2 w-full">
            <div>
              <UserTrophiesBarChart
                data={userGames.map(({ name, trophyCounts }) => ({
                  name,
                  bronze: trophyCounts?.bronze || 0,
                  silver: trophyCounts?.silver || 0,
                  gold: trophyCounts?.gold || 0,
                  platinum: trophyCounts?.platinum || 0,
                }))}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Test</h2>
            </div>
          </section>

          <div>
            <h2 className="text-2xl font-bold mb-4">Detailed Trophies</h2>
            <TrophiesDisplay
              users={userGames.map(({ name, trophies }) => ({
                name,
                trophies,
              }))}
            />
          </div>
        </div>
      ) : (
        <p className="text-center text-lg">No gaming data available.</p>
      )}
    </main>
  );
}
