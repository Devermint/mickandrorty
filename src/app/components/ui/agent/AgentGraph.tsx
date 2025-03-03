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

// Sample data to match the graph in the image
const data = [
  { date: "05-20", value: 50 },
  { date: "05-21", value: 300 },
  { date: "05-22", value: 250 },
  { date: "05-23", value: 180 },
  { date: "05-24", value: 320 },
];

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
        <p>{`${label}: ${payload[0].value}`}</p>
      </Box>
    );
  }
  return null;
};

export default function AgentGraph() {
  return (
    <Box height="100%" width="100%" paddingTop="10px">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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
            domain={[100, 300]}
            ticks={[100, 200, 300]}
            width={45}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
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
