import {
  Box,
  Button,
  Flex,
  IconButton,
  NumberInput,
  Text,
  chakra,
  type IconProps,
  Image,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { colorTokens } from "../theme/theme";
import type { NumberInputValueChangeDetails } from "@chakra-ui/react";
import { PointsIcon } from "../icons/points";

const CloseIcon = (props: IconProps) => (
  <chakra.svg
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 3l6 6M9 3L3 9" />
  </chakra.svg>
);

type PredictionDirection = "for" | "against";

interface MarketOutcome {
  id: string;
  name: string;
  probability: number;
  prices: {
    yes: number;
    no: number;
  };
}

export interface MarketDefinition {
  title: string;
  description: string;
  outcomes: MarketOutcome[];
  avatar: string;
  backgroundImage: string;
  backgroundVideo?: string;
  volumeLabel: string;
  poolTotals?: {
    yes: number;
    no: number;
    total: number;
  };
}

interface PredictionMarketProps {
  videoId?: string;
  marketId?: string;
  onPredict?: (
    direction: PredictionDirection,
    videoId?: string,
    stake?: number
  ) => void;
  definition?: MarketDefinition;
  isSubmitting?: boolean;
}

interface SelectedTrade {
  outcome: MarketOutcome;
  direction: PredictionDirection;
}

const defaultPredictionHandler = (
  direction: PredictionDirection,
  videoId?: string,
  stake?: number
) => {
  console.log(
    `[prediction-market] ${direction.toUpperCase()} bet placed`,
    videoId ?? "unknown-video",
    `stake=${stake ?? 0}`
  );
};

const DEFAULT_MARKET_DEFINITION: MarketDefinition = {
  title: "Will this video reach 100 likes?",
  description: "Predict whether engagement clears the 100-like milestone.",
  outcomes: [
    {
      id: "yes",
      name: "Yes",
      probability: 0.5,
      prices: {
        yes: 0.5,
        no: 0.5,
      },
    },
    {
      id: "no",
      name: "No",
      probability: 0.5,
      prices: {
        yes: 0.5,
        no: 0.5,
      },
    },
  ] satisfies MarketOutcome[],
  avatar: "prediction-market/photo.png",
  backgroundImage: "prediction-market/trum.png",
  volumeLabel: "$200k vol.",
  poolTotals: {
    yes: 100,
    no: 100,
    total: 200,
  },
};

const MIN_STAKE = 1;
const MAX_STAKE = 500;
const DEFAULT_STAKE = 10;

const clampStake = (value: number) =>
  Math.min(MAX_STAKE, Math.max(MIN_STAKE, Math.round(value)));

const YES_BUTTON_BG = "#46DD0B";
const YES_BUTTON_HOVER_BG = "#1D231D";
const YES_BUTTON_TEXT = YES_BUTTON_HOVER_BG;
const NO_BUTTON_BG = "#EB0000";
const NO_BUTTON_HOVER_BG = "#451616";
const NO_BUTTON_TEXT = NO_BUTTON_HOVER_BG;
const FOR_COLOR = YES_BUTTON_BG;
const AGAINST_COLOR = NO_BUTTON_BG;
const FOR_TEXT_COLOR = YES_BUTTON_HOVER_BG;
const AGAINST_TEXT_COLOR = NO_BUTTON_HOVER_BG;
const SURFACE_COLOR = colorTokens.blackCustom.a3;
const SURFACE_ALT_COLOR = colorTokens.blackCustom.a2;
const BORDER_COLOR = colorTokens.blackCustom.a3;
const TEXT_PRIMARY = colorTokens.gray.timberwolf;
const TEXT_MUTED = colorTokens.gray.platinum;

export const PredictionMarket = ({
  videoId,
  marketId,
  onPredict,
  definition: definitionProp,
  isSubmitting = false,
}: PredictionMarketProps) => {
  const definition = definitionProp ?? DEFAULT_MARKET_DEFINITION;
  const [selectedTrade, setSelectedTrade] = useState<SelectedTrade | null>(
    null
  );
  const [stake, setStake] = useState<string>(String(DEFAULT_STAKE));
  const sliderFrameRef = useRef<number | null>(null);
  const sliderPendingValueRef = useRef<number | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const parsedStake = Number.parseFloat(stake);
  const normalizedStake =
    Number.isFinite(parsedStake) && parsedStake > 0 ? parsedStake : 0;

  const pools = definition.poolTotals;
  const yesPool = Math.max(0, pools?.yes ?? 0);
  const noPool = Math.max(0, pools?.no ?? 0);
  const totalPool =
    pools && typeof pools.total === "number" && pools.total > 0
      ? pools.total
      : yesPool + noPool;

  let potentialReturn = 0;
  if (selectedTrade && normalizedStake > 0) {
    const poolBefore = selectedTrade.direction === "for" ? yesPool : noPool;
    const totalBefore = totalPool;
    const poolAfter = poolBefore + normalizedStake;
    const totalAfter = totalBefore + normalizedStake;

    if (poolAfter > 0) {
      potentialReturn = normalizedStake * (totalAfter / poolAfter);
    }
  }

  const tradeLabel = selectedTrade
    ? selectedTrade.direction === "for"
      ? "Confirm Yes"
      : "Confirm No"
    : "Confirm prediction";

  const tradeOptionTitle = selectedTrade
    ? selectedTrade.direction === "for"
      ? "Yes"
      : "No"
    : "";

  const selectedTradeDescription = useMemo(() => {
    if (!selectedTrade) return "";
    return selectedTrade.direction === "for"
      ? "Expected to reach 100 likes"
      : "Expected to stay under 100 likes";
  }, [selectedTrade]);

  const tradeAccentColor =
    selectedTrade?.direction === "against" ? AGAINST_COLOR : FOR_COLOR;
  const tradeAccentText =
    selectedTrade?.direction === "against"
      ? AGAINST_TEXT_COLOR
      : FOR_TEXT_COLOR;

  const handleSelect = useCallback(
    (outcome: MarketOutcome, direction: PredictionDirection) => {
      setSelectedTrade({ outcome, direction });
      if (stake === "") {
        setStake(String(DEFAULT_STAKE));
      }
    },
    [stake]
  );

  const handleReset = useCallback(() => {
    setSelectedTrade(null);
    setStake(String(DEFAULT_STAKE));
  }, []);

  const handleSetStake = useCallback((value: number) => {
    if (Number.isNaN(value)) return;
    const clamped = clampStake(value);
    setStake((previous) => {
      const next = String(clamped);
      return previous === next ? previous : next;
    });
  }, []);

  const handleNumberInputChange = useCallback(
    ({ value, valueAsNumber }: NumberInputValueChangeDetails) => {
      if (value === "" || value === undefined) {
        setStake((previous) => (previous === "" ? previous : ""));
        return;
      }
      if (!Number.isNaN(valueAsNumber)) {
        handleSetStake(valueAsNumber);
      }
    },
    [handleSetStake]
  );

  const handleQuickAdd = useCallback((delta: number) => {
    setStake((previous) => {
      const parsedPrevious = Number.parseFloat(previous);
      const base =
        Number.isFinite(parsedPrevious) && parsedPrevious > 0
          ? parsedPrevious
          : 0;
      if (base === 0 && delta <= 0) {
        return String(MIN_STAKE);
      }
      const next = clampStake(Math.max(MIN_STAKE, base + delta));
      return String(next);
    });
  }, []);

  const handlePredict = useCallback(() => {
    if (!selectedTrade || isSubmitting) return;
    const handler = onPredict ?? defaultPredictionHandler;
    handler(
      selectedTrade.direction,
      videoId ?? marketId,
      Number.isFinite(parsedStake) ? parsedStake : 0
    );
    handleReset();
  }, [
    handleReset,
    isSubmitting,
    marketId,
    onPredict,
    parsedStake,
    selectedTrade,
    videoId,
  ]);

  const sliderValue = normalizedStake
    ? clampStake(normalizedStake)
    : clampStake(MIN_STAKE);
  const sliderPercent = Math.round(
    ((sliderValue - MIN_STAKE) / (MAX_STAKE - MIN_STAKE)) * 100
  );
  const sliderTrackBackground = `linear-gradient(90deg, ${
    selectedTrade?.direction === "against" ? AGAINST_COLOR : FOR_COLOR
  } ${sliderPercent}%, ${SURFACE_ALT_COLOR} ${sliderPercent}%)`;

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.valueAsNumber;
      if (!Number.isFinite(nextValue)) return;
      sliderPendingValueRef.current = nextValue;
      if (sliderFrameRef.current !== null) return;
      sliderFrameRef.current = requestAnimationFrame(() => {
        const pending = sliderPendingValueRef.current;
        if (typeof pending === "number" && Number.isFinite(pending)) {
          handleSetStake(pending);
        }
        sliderPendingValueRef.current = null;
        sliderFrameRef.current = null;
      });
    },
    [handleSetStake]
  );

  useEffect(() => {
    return () => {
      if (sliderFrameRef.current !== null) {
        cancelAnimationFrame(sliderFrameRef.current);
        sliderFrameRef.current = null;
      }
    };
  }, []);

  // ── replace your collapsedMarket with this ─────────────────────────────────────
  const hasBackgroundVideo = Boolean(
    definition.backgroundVideo && definition.backgroundVideo.length > 0
  );

  const backgroundMedia = hasBackgroundVideo ? (
    <chakra.video
      ref={previewVideoRef}
      src={definition.backgroundVideo}
      loop
      muted
      playsInline
      preload="metadata"
      position="absolute"
      inset={0}
      w="full"
      h="full"
      objectFit="cover"
      pointerEvents="none"
      aria-hidden="true"
    />
  ) : (
    <Image
      src={definition.backgroundImage}
      position="absolute"
      inset={0}
      w="full"
      h="full"
      objectFit="cover"
      aria-hidden="true"
      pointerEvents="none"
    />
  );

  const handlePreviewEnter = useCallback(() => {
    if (!hasBackgroundVideo) return;
    const video = previewVideoRef.current;
    if (!video) return;
    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => undefined);
      }
    } catch {
      // ignore play errors (e.g. autoplay restrictions)
    }
  }, [hasBackgroundVideo]);

  const handlePreviewLeave = useCallback(() => {
    if (!hasBackgroundVideo) return;
    const video = previewVideoRef.current;
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      // some browsers may reject setting currentTime on certain codecs; ignore
    }
  }, [hasBackgroundVideo]);

  useEffect(() => {
    return () => {
      const video = previewVideoRef.current;
      if (video) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const collapsedMarket = (
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        onMouseEnter={hasBackgroundVideo ? handlePreviewEnter : undefined}
        onMouseLeave={hasBackgroundVideo ? handlePreviewLeave : undefined}
        onFocus={hasBackgroundVideo ? handlePreviewEnter : undefined}
        onBlur={hasBackgroundVideo ? handlePreviewLeave : undefined}
        onPointerDown={hasBackgroundVideo ? handlePreviewEnter : undefined}
        onPointerUp={hasBackgroundVideo ? handlePreviewLeave : undefined}
        onPointerCancel={hasBackgroundVideo ? handlePreviewLeave : undefined}
      >
      {backgroundMedia}

      <Flex
        direction="column"
        gap={4}
        position="relative"
        align={"end"}
        zIndex={1}
        h="full"
      >
        {/* === TOP ROW: title and volume (above blur zone) === */}
        <Flex align="center" gap={3} p={3}>
          <Box
            px={2}
            py={1}
            borderRadius={9}
            bg="blackAlpha.700"
            color="white"
            fontSize={12}
            whiteSpace="nowrap"
          >
            {definition.volumeLabel ?? "no wagers yet"}
          </Box>
        </Flex>

        {/* === BLURRED ZONE BELOW === */}
        <Flex position="relative" mt="auto" w="full">
          {/* Backdrop blur zone (only under desc + buttons) */}
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            top={0}
            pointerEvents="none"
            zIndex={1}
            style={{
              backdropFilter: "blur(2px)",
              background:
                "linear-gradient(0deg, #181818 0%, rgba(24, 24, 24, 0.80) 100%)",
            }}
          />

          {/* Content inside blurred zone */}
          <Flex
            direction="column"
            position="relative"
            zIndex={1}
            p={3}
            w="full"
          >
            <Text
              fontSize={{ base: "md", md: "md" }}
              color="white"
              mb={3}
              flex="1"
              w="full"
            >
              {definition.title}
            </Text>
            {/* Outcome buttons */}
            <Flex gap={3} justify="space-between">
              {definition.outcomes.map((outcome) => {
                const isYesOutcome = outcome.id === "yes";
                const direction: PredictionDirection = isYesOutcome
                  ? "for"
                  : "against";
                const isSelected =
                  selectedTrade?.outcome.id === outcome.id &&
                  selectedTrade.direction === direction;

                const pct = Math.round((outcome.probability ?? 0) * 100);
                const pctWidth = `${Math.min(Math.max(pct, 0), 100)}%`;

                const baseBg = isYesOutcome
                  ? YES_BUTTON_HOVER_BG
                  : NO_BUTTON_HOVER_BG;
                // const hoverBg = isYesOutcome
                //   ? YES_BUTTON_HOVER_BG
                //   : NO_BUTTON_HOVER_BG;
                const baseText = isYesOutcome
                  ? YES_BUTTON_TEXT
                  : NO_BUTTON_TEXT;

                const chipBg = isYesOutcome ? YES_BUTTON_BG : NO_BUTTON_BG;
                const chipText = "black";

                return (
                  <Button
                    key={outcome.id}
                    onClick={() => handleSelect(outcome, direction)}
                    justifyContent="flex-start"
                    alignItems="center"
                    gap={3}
                    flex="1"
                    px={4}
                    py={4}
                    h="64px"
                    borderRadius={9}
                    fontWeight="bold"
                    fontSize="md"
                    bg={baseBg}
                    color={isSelected ? "white" : baseText}
                    borderWidth="1px"
                    borderColor={baseBg}
                    position="relative"
                    overflow="hidden"
                    zIndex={2}
                    opacity={0.8}
                  >
                    <Flex
                      position="relative"
                      zIndex={1}
                      opacity={1}
                      w="full"
                      align="center"
                      justify="space-between"
                    >
                      <Box
                        px={3}
                        py={3}
                        borderRadius={6}
                        bg={chipBg}
                        color={chipText}
                        fontWeight="extrabold"
                        lineHeight="1"
                      >
                        {pct}%
                      </Box>
                      <Text
                        as="span"
                        fontWeight="extrabold"
                        opacity={1}
                        color={chipBg}
                      >
                        {outcome.name}
                      </Text>
                    </Flex>
                  </Button>
                );
              })}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );

  const expandedMarket = selectedTrade && (
    <Flex direction="column" gap={5}>
      <Flex align="flex-start" justify="space-between" gap={4}>
        <Flex align="center" gap={3}>
          <Box
            w="40px"
            h="40px"
            borderRadius="md"
            bg={SURFACE_COLOR}
            borderWidth="1px"
            borderColor={BORDER_COLOR}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={TEXT_PRIMARY}
            fontWeight="semibold"
            fontSize="sm"
          >
            {selectedTrade.direction === "for" ? "YES" : "NO"}
          </Box>
          <Flex direction="column" gap={0.5}>
            <Text fontSize="xs" fontWeight="semibold" color={TEXT_PRIMARY}>
              {tradeOptionTitle}
            </Text>
            <Text fontSize="xs" color={TEXT_MUTED}>
              {selectedTradeDescription}
            </Text>
          </Flex>
        </Flex>
        <IconButton
          aria-label="Close trade"
          size="xs"
          variant="ghost"
          color={TEXT_PRIMARY}
          border="none"
          _focusVisible={{ boxShadow: "none" }}
          _hover={{ color: AGAINST_COLOR, bg: "transparent" }}
          onClick={handleReset}
        >
          <CloseIcon boxSize="16px" />
        </IconButton>
      </Flex>

      <Box
        px={4}
        py={3}
        borderRadius="lg"
        bg={SURFACE_COLOR}
        borderWidth="1px"
        borderColor={BORDER_COLOR}
      >
        <Text fontSize="xs" textTransform="uppercase" color={TEXT_MUTED}>
          Stake
        </Text>
        <Flex
          mt={2}
          align={["stretch", "center"]}
          justify="space-between"
          gap={3}
        >
          <NumberInput.Root
            value={stake}
            min={MIN_STAKE}
            max={MAX_STAKE}
            clampValueOnBlur={false}
            onValueChange={handleNumberInputChange}
            maxW="160px"
            flex="1"
            step={1}
            formatOptions={{ maximumFractionDigits: 0 }}
            border="none"
          >
            <NumberInput.Scrubber display="none" />
            <Flex
              overflow="hidden"
              bg={SURFACE_ALT_COLOR}
              border="none"
              align="center"
              h="full"
              m={0}
              borderRadius={6}
            >
              <Box px={1}>
                <PointsIcon w={4} h={4} />
              </Box>
              <NumberInput.Input
                aria-label="Stake amount"
                flex="1"
                border="none"
                bg="transparent"
                color={TEXT_PRIMARY}
                focusRing="none"
                inputMode="numeric"
                pattern="[0-9]*"
                px={0}
                py={2}
              />
              <NumberInput.Control
                display="flex"
                flexDir="column"
                justifyContent="space-between"
                borderLeft="1px solid"
                borderLeftColor="gray.800"
                bg={SURFACE_ALT_COLOR}
                minW="32px"
                h="100%"
                m={0}
                borderRightRadius={6}
              >
                <NumberInput.IncrementTrigger
                  aria-label="Increase stake"
                  bg={SURFACE_ALT_COLOR}
                  color={TEXT_PRIMARY}
                  _hover={{ bg: SURFACE_ALT_COLOR, color: TEXT_PRIMARY }}
                  _active={{ bg: SURFACE_COLOR, color: TEXT_PRIMARY }}
                />
                <NumberInput.DecrementTrigger
                  aria-label="Decrease stake"
                  bg={SURFACE_ALT_COLOR}
                  color={TEXT_PRIMARY}
                  borderTop="1px solid"
                  _hover={{ bg: SURFACE_ALT_COLOR, color: TEXT_PRIMARY }}
                  _active={{ bg: SURFACE_COLOR, color: TEXT_PRIMARY }}
                  borderTopColor="gray.800"
                />
              </NumberInput.Control>
            </Flex>
          </NumberInput.Root>

          <Flex gap={2} flexShrink={0}>
            {[1, 10].map((quick) => (
              <Button
                key={quick}
                size="xs"
                borderRadius="md"
                bg={SURFACE_ALT_COLOR}
                color={TEXT_PRIMARY}
                borderWidth="1px"
                borderColor={BORDER_COLOR}
                _hover={{ bg: SURFACE_ALT_COLOR, opacity: 0.85 }}
                _active={{ bg: SURFACE_COLOR }}
                _focusVisible={{ boxShadow: "none", bg: SURFACE_ALT_COLOR }}
                onClick={() => handleQuickAdd(quick)}
              >
                +{quick}
              </Button>
            ))}
          </Flex>
        </Flex>

        <chakra.input
          type="range"
          min={MIN_STAKE}
          max={MAX_STAKE}
          value={sliderValue}
          onChange={handleSliderChange}
          mt={4}
          css={{
            appearance: "none",
            width: "100%",
            height: "6px",
            borderRadius: "999px",
            background: sliderTrackBackground,
            outline: "none",
            cursor: "pointer",
            "&::-webkit-slider-thumb": {
              appearance: "none",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: tradeAccentColor,
              border: `2px solid ${SURFACE_ALT_COLOR}`,
            },
            "&::-moz-range-thumb": {
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: tradeAccentColor,
              border: `2px solid ${SURFACE_ALT_COLOR}`,
            },
          }}
        />
      </Box>

      <Button
        py={6}
        borderRadius="lg"
        bg={tradeAccentColor}
        color={tradeAccentText}
        fontWeight="semibold"
        fontSize="md"
        letterSpacing="0.01em"
        _hover={{ opacity: 0.92 }}
        disabled={normalizedStake <= 0 || isSubmitting}
        loading={isSubmitting}
        loadingText="Placing bet"
        onClick={handlePredict}
      >
        <Flex direction="column" align="center" gap={1} lineHeight="1.2">
          <Text color={tradeAccentText}>{tradeLabel}</Text>
          <Text fontSize="xs" color={tradeAccentText} opacity={0.8}>
            {selectedTrade && normalizedStake > 0 && potentialReturn > 0
              ? `Payout ≈ ${potentialReturn.toFixed(2)} pts`
              : "Enter a stake to continue"}
          </Text>
        </Flex>
      </Button>
    </Flex>
  );

  const isExpanded = Boolean(selectedTrade);

  return (
    <Box position="relative" overflow="hidden">
      <Box
        css={{
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: isExpanded ? 0 : 1,
          transform: isExpanded ? "translateY(-16px)" : "translateY(0)",
          pointerEvents: isExpanded ? "none" : "auto",
          position: isExpanded ? "absolute" : "relative",
          inset: 0,
        }}
      >
        {collapsedMarket}
      </Box>
      <Box
        css={{
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateY(0)" : "translateY(16px)",
          pointerEvents: isExpanded ? "auto" : "none",
        }}
      >
        {expandedMarket}
      </Box>
    </Box>
  );
};
