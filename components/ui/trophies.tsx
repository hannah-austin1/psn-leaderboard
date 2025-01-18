import { Game } from "@/types/interfaces";
import { Card, CardContent } from "./card";

interface TrophiesDisplayProps {
  users: {
    name: string;
    trophies?: Game[];
  }[];
}

export default function TrophiesDisplay({ users }: TrophiesDisplayProps) {
  return (
    <Card>
      <CardContent className="grid grid-cols-4">
        {users.map((user) => (
          <div key={user.name} className="p-4 border rounded shadow-sm">
            <h3 className="font-bold text-lg">{user.name}</h3>
            {user.trophies && user.trophies.length > 0 ? (
              <div>
                {user.trophies.map((trophy, index) => (
                  <div key={`${user.name}-${trophy.gameName}-${index}`}>
                    <b>{trophy.gameName}</b>
                    <ul className="list-disc ml-4">
                      {trophy.trophyList.map((tl, tlIndex) => (
                        <li
                          key={`${trophy.gameName}-${tl.trophyName}-${tlIndex}`}
                        >
                          {tl.trophyName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p>No trophies available.</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
