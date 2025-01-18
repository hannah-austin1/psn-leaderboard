"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, Tooltip, Legend } from "recharts";

interface UserTrophiesData {
  name: string;
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

interface UserTrophiesBarChartProps {
  data: UserTrophiesData[];
}

export default function UserTrophiesBarChart({
  data,
}: UserTrophiesBarChartProps) {
  const chartConfig = {
    bronze: { label: "Bronze", color: "hsl(var(--chart-1))" },
    silver: { label: "Silver", color: "hsl(var(--chart-2))" },
    gold: { label: "Gold", color: "hsl(var(--chart-3))" },
    platinum: { label: "Platinum", color: "hsl(var(--chart-4))" },
  };

  return (
    <Card className="flex flex-col">
      {/* <CardHeader className="items-center pb-0">
        <CardTitle>User Trophies</CardTitle>
      </CardHeader> */}
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" type="category" />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="bronze" fill="hsl(var(--chart-1))" radius={4} />
            <Bar dataKey="silver" fill="hsl(var(--chart-2))" radius={4} />
            <Bar dataKey="gold" fill="hsl(var(--chart-3))" radius={4} />
            <Bar dataKey="platinum" fill="hsl(var(--chart-4))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
