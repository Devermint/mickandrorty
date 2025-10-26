"use client";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { PredictionMarket } from "@/app/components/Media/PredictionMarket";
import { colorTokens } from "@/app/components/theme/theme";

const SAMPLE_PREDICTIONS = Array.from({ length: 16 }).map((_, index) => ({
  id: `prediction-${index + 1}`,
  question: "Will Trump add tax for being trans?",
  description:
    "Forecast whether this policy change will be announced before year-end.",
  yesPercent: 34,
  noPercent: 66,
}));

const clampProbability = (value: number) => {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(100, Math.max(0, value)) / 100;
};

export default function PredictionsPage() {
  return (
    <Flex flex={1} overflowY="auto" justify="center" px={{ base: 4, lg: 6 }}>
      <Flex direction="column" w="full" maxW="1620px" py={6}>
        <Text
          fontFamily="inter"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight={600}
          color="white"
        >
          Predictions
        </Text>

        <Box mt={6} pb={6}>
          <SimpleGrid
            columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }}
            gap={{ base: 2, lg: 4 }}
          >
            {SAMPLE_PREDICTIONS.map((prediction) => {
              const yesProb = clampProbability(prediction.yesPercent);
              const noProb = clampProbability(prediction.noPercent);
              const total = yesProb + noProb || 1;
              const normalizedYes = yesProb / total;
              const normalizedNo = noProb / total;

              return (
                <PredictionMarket
                  key={prediction.id}
                  definition={{
                    title: prediction.question,
                    description:
                      prediction.description ??
                      "Place your prediction on this market.",
                    outcomes: [
                      {
                        id: "yes",
                        name: "Yes",
                        probability: normalizedYes,
                        prices: {
                          yes: normalizedYes,
                          no: normalizedNo,
                        },
                      },
                      {
                        id: "no",
                        name: "No",
                        probability: normalizedNo,
                        prices: {
                          yes: normalizedNo,
                          no: normalizedYes,
                        },
                      },
                    ],
                  }}
                />
              );
            })}
          </SimpleGrid>
        </Box>
      </Flex>
    </Flex>
  );
}
