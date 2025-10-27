import {
  Box,
  Button,
  Flex,
  IconButton,
  NumberInput,
  Text,
  chakra,
  type IconProps,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { colorTokens } from "../theme/theme";
import type { NumberInputValueChangeDetails } from "@chakra-ui/react";

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
}

interface PredictionMarketProps {
  videoId?: string;
  onPredict?: (
    direction: PredictionDirection,
    videoId?: string,
    stake?: number
  ) => void;
  definition?: MarketDefinition;
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
      probability: 0.6,
      prices: {
        yes: 0.6,
        no: 0.4,
      },
    },
    {
      id: "no",
      name: "No",
      probability: 0.4,
      prices: {
        yes: 0.4,
        no: 0.6,
      },
    },
  ] satisfies MarketOutcome[],
};

const MIN_STAKE = 1;
const MAX_STAKE = 500;
const DEFAULT_STAKE = 10;

const clampStake = (value: number) =>
  Math.min(MAX_STAKE, Math.max(MIN_STAKE, Math.round(value)));

const YES_BUTTON_BG = "#84D89A";
const YES_BUTTON_HOVER_BG = "#1C7A3A";
const YES_BUTTON_TEXT = YES_BUTTON_HOVER_BG;
const NO_BUTTON_BG = "#F48A9A";
const NO_BUTTON_HOVER_BG = "#A61B2D";
const NO_BUTTON_TEXT = NO_BUTTON_HOVER_BG;
const FOR_COLOR = YES_BUTTON_HOVER_BG;
const AGAINST_COLOR = NO_BUTTON_HOVER_BG;
const SURFACE_COLOR = colorTokens.blackCustom.a3;
const SURFACE_ALT_COLOR = colorTokens.blackCustom.a2;
const BORDER_COLOR = colorTokens.blackCustom.a3;
const TEXT_PRIMARY = colorTokens.gray.timberwolf;
const TEXT_MUTED = colorTokens.gray.platinum;

export const PredictionMarket = ({
  videoId,
  onPredict,
  definition: definitionProp,
}: PredictionMarketProps) => {
  const definition = definitionProp ?? DEFAULT_MARKET_DEFINITION;
  const [selectedTrade, setSelectedTrade] = useState<SelectedTrade | null>(
    null
  );
  const [stake, setStake] = useState<string>(String(DEFAULT_STAKE));
  const sliderFrameRef = useRef<number | null>(null);
  const sliderPendingValueRef = useRef<number | null>(null);

  const parsedStake = Number.parseFloat(stake);
  const normalizedStake =
    Number.isFinite(parsedStake) && parsedStake > 0 ? parsedStake : 0;

  const price = selectedTrade
    ? selectedTrade.direction === "for"
      ? selectedTrade.outcome.prices.yes
      : selectedTrade.outcome.prices.no
    : 0;

  const potentialReturn =
    normalizedStake > 0 && price > 0 ? normalizedStake / price : 0;
  const potentialProfit =
    potentialReturn > 0 ? potentialReturn - normalizedStake : 0;

  const formattedStake =
    normalizedStake > 0
      ? `$${normalizedStake.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : "$0";

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
  const tradeAccentText = "white";

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
    if (!selectedTrade) return;
    const handler = onPredict ?? defaultPredictionHandler;
    handler(
      selectedTrade.direction,
      videoId,
      Number.isFinite(parsedStake) ? parsedStake : 0
    );
    handleReset();
  }, [handleReset, onPredict, parsedStake, selectedTrade, videoId]);

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

  const collapsedMarket = (
    <Flex direction="column" gap={3}>
      <Flex direction="column" gap={1}>
        <Text fontSize="sm" fontWeight="semibold" color={TEXT_PRIMARY}>
          {definition.title}
        </Text>
        <Text fontSize="xs" color={TEXT_MUTED}>
          {definition.description}
        </Text>
      </Flex>

      <Flex gap={2} justify="space-between">
        {definition.outcomes.map((outcome) => {
          const isYesOutcome = outcome.id === "yes";
          const direction: PredictionDirection = isYesOutcome
            ? "for"
            : "against";
          const isSelected =
            selectedTrade?.outcome.id === outcome.id &&
            selectedTrade.direction === direction;
          const baseBg = isYesOutcome ? YES_BUTTON_BG : NO_BUTTON_BG;
          const hoverBg = isYesOutcome
            ? YES_BUTTON_HOVER_BG
            : NO_BUTTON_HOVER_BG;
          const baseText = isYesOutcome ? YES_BUTTON_TEXT : NO_BUTTON_TEXT;

          return (
            <Button
              key={outcome.id}
              onClick={() => handleSelect(outcome, direction)}
              justifyContent="space-between"
              alignItems="center"
              flex="1"
              px={3}
              py={3}
              h="auto"
              borderRadius="lg"
              fontWeight="semibold"
              fontSize="sm"
              bg={isSelected ? hoverBg : baseBg}
              color={isSelected ? "white" : baseText}
              borderWidth="1px"
              borderColor={isSelected ? hoverBg : baseBg}
              _hover={{ bg: hoverBg, color: "white" }}
              _active={{ bg: hoverBg, color: "white" }}
              _focusVisible={{ boxShadow: "none" }}
            >
              <Text fontSize="sm" fontWeight="semibold" color="inherit">
                {outcome.name}
              </Text>
              <Text fontSize="lg" fontWeight="semibold" color="inherit">
                {Math.round(outcome.probability * 100)}%
              </Text>
            </Button>
          );
        })}
      </Flex>
    </Flex>
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
              <Box
                px={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={TEXT_MUTED}
                fontWeight="semibold"
                border="none"
              >
                $
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
        disabled={normalizedStake <= 0}
        onClick={handlePredict}
      >
        <Flex direction="column" align="center" gap={1} lineHeight="1.2">
          <Text>{tradeLabel}</Text>
          <Text fontSize="xs" color={tradeAccentText} opacity={0.8}>
            {normalizedStake > 0 && price > 0
              ? `To win $${potentialProfit.toFixed(2)}`
              : "Enter a stake to continue"}
          </Text>
        </Flex>
      </Button>
    </Flex>
  );

  const isExpanded = Boolean(selectedTrade);

  return (
    <Box
      w="full"
      px={{ base: 4, md: 5 }}
      py={{ base: 5, md: 6 }}
      borderRadius="2xl"
      bg={SURFACE_ALT_COLOR}
      borderWidth="1px"
      borderColor={BORDER_COLOR}
      position="relative"
      overflow="hidden"
    >
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
