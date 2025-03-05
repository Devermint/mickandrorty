"use client";

import { Box } from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

interface MessageHistoryData {
  date: string;
  count: number;
}

interface AgentGraphProps {
  data: MessageHistoryData[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="#1D3114"
        p="10px"
        border="1px solid #AFDC29"
        borderRadius="4px"
        color="#AFDC29"
        fontSize="12px"
      >
        <p>{`${label}: ${payload[0].value} messages`}</p>
      </Box>
    );
  }
  return null;
};

export default function AgentGraph({ data }: AgentGraphProps) {
  // If no data, show empty graph with 0 values
  const graphData = data.length > 0 ? data : [{ date: "Today", count: 0 }];

  // Calculate domain for Y axis
  const maxCount = Math.max(...graphData.map((d) => d.count));
  const yDomain = [0, Math.max(100, Math.ceil(maxCount / 100) * 100)];

  return (
    <Box height="100%" width="100%" paddingTop="10px">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={graphData}
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          style={{ backgroundColor: "transparent" }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#AFDC29" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1D3114" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#444"
            opacity={0.2}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{
              fill: "#AFDC29",
              fontSize: "10px",
              style: { fontSize: "10px" },
            }}
            axisLine={{ stroke: "#444", opacity: 0.2 }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: "#AFDC29",
              fontSize: "10px",
              style: { fontSize: "10px" },
            }}
            axisLine={false}
            tickLine={false}
            domain={yDomain}
            width={45}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#AFDC29"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            activeDot={{ r: 6, fill: "#AFDC29", stroke: "#1D3114" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
