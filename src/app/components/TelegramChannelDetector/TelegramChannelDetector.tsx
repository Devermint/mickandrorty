"use client";

import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import {
  TelegramChannelDetectionResult,
  TelegramChannelInfo,
} from "@/app/types/message";
import { colorTokens } from "../theme/theme";

type TelegramChannelDetectorProps = {
  botToken: string;
  onComplete?: (result: TelegramChannelDetectionResult) => void;
};

type DetectResponse = {
  channels?: TelegramChannelInfo[];
  lastUpdateId?: number | null;
  updateCount?: number;
  error?: string;
  details?: string;
};

export const TelegramChannelDetector = ({
  botToken,
  onComplete,
}: TelegramChannelDetectorProps) => {
  const [channels, setChannels] = useState<TelegramChannelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDetected, setHasDetected] = useState(false);
  const [updateCount, setUpdateCount] = useState<number>(0);
  const tokenReady = botToken.trim().length > 0;

  const handleDetect = useCallback(async () => {
    if (!tokenReady) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/telegram/bot-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as DetectResponse | null;

      if (!response.ok) {
        const message =
          payload?.details || payload?.error || "Failed to detect channels.";
        throw new Error(message);
      }

      const detected = Array.isArray(payload?.channels)
        ? payload?.channels
        : [];
      setChannels(detected);
      setUpdateCount(
        typeof payload?.updateCount === "number" ? payload.updateCount : 0
      );
      setHasDetected(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected detection error.";
      setError(message);
      setChannels([]);
      setUpdateCount(0);
      setHasDetected(false);
    } finally {
      setIsLoading(false);
    }
  }, [botToken, tokenReady]);

  const handleComplete = useCallback(() => {
    if (!onComplete) return;
    onComplete({ botToken, channels });
  }, [botToken, channels, onComplete]);

  return (
    <Stack gap={4}>
      <Text color={colorTokens.gray.timberwolf} fontSize="sm">
        Add this bot as an administrator to the channels you plan to use, then
        click the button below to detect them. Press <strong>Done</strong> to
        send the channel IDs back to the assistant.
      </Text>

      <Flex gap={3} wrap="wrap">
        <Button
          size="sm"
          onClick={handleDetect}
          loading={isLoading}
          loadingText="Detecting..."
          borderWidth={1}
          borderColor={colorTokens.gray.platinum}
          bg={colorTokens.blackCustom.a3}
          color={colorTokens.gray.timberwolf}
          disabled={!tokenReady || isLoading}
          _hover={{
            bg: colorTokens.blackCustom.a2,
            color: colorTokens.green.erin,
            borderColor: colorTokens.green.erin,
          }}
          _active={{
            bg: colorTokens.blackCustom.a3,
            color: colorTokens.green.erin,
            borderColor: colorTokens.green.erin,
          }}
          _disabled={{
            opacity: 0.4,
            cursor: "not-allowed",
            color: colorTokens.gray.platinum,
          }}
        >
          Detect channels
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderWidth={1}
          borderColor={colorTokens.gray.platinum}
          onClick={handleComplete}
          disabled={!tokenReady || !hasDetected}
          color={colorTokens.gray.timberwolf}
          _hover={{
            borderColor: colorTokens.green.erin,
            color: colorTokens.green.erin,
          }}
          _active={{
            borderColor: colorTokens.green.erin,
            color: colorTokens.green.erin,
          }}
          _disabled={{
            opacity: 0.4,
            cursor: "not-allowed",
            color: colorTokens.gray.platinum,
          }}
        >
          Done
        </Button>
      </Flex>

      {isLoading && (
        <Flex align="center" gap={3} color={colorTokens.gray.timberwolf}>
          <Spinner size="sm" />
          <Text fontSize="sm">Detecting channels…</Text>
        </Flex>
      )}

      {!tokenReady && (
        <Text color="rgba(255,255,255,0.55)" fontSize="xs">
          Waiting for a Telegram bot token. Provide it in chat first, then run
          the detector.
        </Text>
      )}

      {error && (
        <Box
          borderRadius="md"
          borderWidth="1px"
          borderColor="rgba(255, 99, 132, 0.35)"
          bg="rgba(255, 99, 132, 0.08)"
          p={3}
        >
          <Text color="rgba(255, 133, 153, 1)" fontSize="sm">
            {error}
          </Text>
        </Box>
      )}

      {hasDetected && !error && (
        <Stack gap={3}>
          <Flex align="center" justify="space-between">
            <Text color={colorTokens.gray.platinum} fontSize="sm">
              {channels.length > 0
                ? `Detected ${channels.length} channel${
                    channels.length === 1 ? "" : "s"
                  }.`
                : "No channels detected yet."}
            </Text>
            <Badge
              colorScheme="purple"
              bg="rgba(108, 99, 255, 0.12)"
              color={colorTokens.gray.timberwolf}
            >
              Updates checked: {updateCount}
            </Badge>
          </Flex>

          <Box
            borderTopWidth="1px"
            borderColor="rgba(255,255,255,0.05)"
            borderStyle="solid"
          />

          {channels.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
              {channels.map((channel) => (
                <Box
                  key={channel.chatId}
                  borderWidth="1px"
                  borderColor="rgba(86, 240, 159, 0.18)"
                  borderRadius="md"
                  bg="rgba(14,16,18,0.6)"
                  p={3}
                >
                  <Stack gap={1}>
                    <Text
                      fontWeight="semibold"
                      color={colorTokens.gray.platinum}
                      fontSize="sm"
                    >
                      {channel.title ?? channel.username ?? "Unnamed channel"}
                    </Text>
                    {channel.username && (
                      <Text color="rgba(255,255,255,0.6)" fontSize="xs">
                        @{channel.username}
                      </Text>
                    )}
                    <Text color="rgba(255,255,255,0.6)" fontSize="xs">
                      Type: {channel.type}
                    </Text>
                    {channel.status && (
                      <Text color="rgba(255,255,255,0.6)" fontSize="xs">
                        Status: {channel.status}
                      </Text>
                    )}
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="rgba(255,255,255,0.6)" fontSize="sm">
              We did not detect any channels. Make sure the bot has been added
              and promoted as an administrator, then try again.
            </Text>
          )}

          <Text color="rgba(255,255,255,0.45)" fontSize="xs">
            Channel IDs are saved automatically with this detection and will be
            included in the confirmation step.
          </Text>
        </Stack>
      )}
    </Stack>
  );
};
