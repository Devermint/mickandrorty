"use client";
import { VStack, Text, Progress } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";

type JsonProgressProps = {
  progress: string;
};

export const AgentVideoLoader = ({ progress }: JsonProgressProps) => {
  const match = progress.match(/(\d+)\/(\d+)/);
  const done = match ? parseInt(match[1], 10) : 0;
  const max = match ? parseInt(match[2], 10) : 100;
  const pct = (done / max) * 100;

  return (
    <VStack align="stretch" flex={1} mt={2} w="100%">
      <Progress.Root
        value={pct}
        min={0}
        max={100}
        size="sm"
        w={{ base: 100, md: "100%" }}
        striped
        animated
        style={
          {
            "--stripe-color": "#1A1D1F",
          } as React.CSSProperties
        }
      >
        <Progress.Track bgColor={colorTokens.gray.platinum}>
          <Progress.Range bgColor={colorTokens.blackCustom.a1} />
        </Progress.Track>
      </Progress.Root>

      <Text fontWeight="bold" color={colorTokens.gray.platinum}>
        {`Generating... ${pct.toPrecision(2)}%`}
      </Text>
      <Text fontSize="xs" color="gray.500"></Text>
    </VStack>
  );
};
