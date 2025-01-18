"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, LabelList } from "recharts";

interface RadialBarChartPropsData {
  name: string;
  hours: number;
}

interface RadialBarChartProps {
  data: RadialBarChartPropsData[];
  usersCount: number;
}

interface ChartData extends RadialBarChartPropsData {
  fill: string;
}

export default function GameRadialBarChart({ data }: RadialBarChartProps) {
  const [chartData, setChartData] = useState<Array<ChartData>>([]);

  const chartConfig = {
    hours: {
      label: "Hours",
    },
    Hannah: {
      label: "Hannah",
      color: "hsl(var(--chart-1))",
    },
    Ed: {
      label: "Ed",
      color: "hsl(var(--chart-2))",
    },
    Luke: {
      label: "Luke",
      color: "hsl(var(--chart-3))",
    },
    Allie: {
      label: "Allie",
      color: "hsl(var(--chart-4))",
    },
  };

  useEffect(() => {
    if (data.length) {
      const mappedData = data.map((game) => ({
        ...game,
        fill: `var(--color-${game.name})`, // Random color
      }));
      setChartData(mappedData);
    }
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={60}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <RadialBar dataKey="hours" cornerRadius={10}>
              <LabelList
                position="insideStart"
                dataKey="name"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={8}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
