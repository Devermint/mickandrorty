"use client";
import { VStack, Text, Progress } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";

type JsonProgressProps = {
  progress: string;
};

export const AgentVideoLoader = ({ progress }: JsonProgressProps) => {
  // Check if progress starts with "Progress:" to determine if it's a progress update
  const isProgressUpdate = progress.toLowerCase().startsWith('progress:');
  
  const match = progress.match(/(\d+)\/(\d+)/);
  const done = match ? parseInt(match[1], 10) : 0;
  const max = match ? parseInt(match[2], 10) : 100;
  const pct = max > 0 ? ((done / max) * 100) : 0;

  return (
    <VStack align="stretch" flex={1} mt={2}>
      <Progress.Root
        value={isProgressUpdate ? pct : 0}
        min={0}
        max={100}
        size="sm"
        w={{ base: 100, md: "100%" }}
        minW={{ base: 100, md: "100%" }}
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

      {isProgressUpdate && pct == 0 &&
        <Text fontWeight="bold" color={colorTokens.gray.platinum}>
          Waiting for status updates...
        </Text>
      }
      {isProgressUpdate && pct > 0 &&
        <Text fontWeight="bold" color={colorTokens.gray.platinum}>
          {`Generating... ${pct.toPrecision(2)}%`}
        </Text>
      }
      {!isProgressUpdate &&
        <Text fontWeight="bold" color={colorTokens.gray.platinum}>
          {progress}
        </Text>
      }
      <Text fontSize="xs" color="gray.500"></Text>
    </VStack>
  );
};
