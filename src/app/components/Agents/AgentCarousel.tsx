"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Button, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider";
import "keen-slider/keen-slider.min.css";
import { Agent } from "@/app/types/agent";
import { ChevronLeftIcon } from "../icons/chevronLeft";
import { ChevronRightIcon } from "../icons/chevronRight";
import { AgentCard } from "./AgentCard";

type AgentCarouselProps = {
  agents: Agent[];
  activeId: string | null | undefined;
  setActiveId: (id: string | null) => void;
};

export const AgentCarousel = ({
  agents,
  activeId,
  setActiveId,
}: AgentCarouselProps) => {
  const innerRefs = useRef<HTMLDivElement[]>([]);

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const initialIndex = 1;
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  useEffect(() => {
    if (!agents.length) {
      setActiveId(null);
      setActiveIdx(0);
      return;
    }

    if (!activeId || !agents.some((a) => a.fa_id === activeId)) {
      const idx = Math.min(initialIndex, Math.max(0, agents.length - 1));
      setActiveIdx(idx);
      setActiveId(agents[idx]?.fa_id ?? agents[0]?.fa_id ?? null);
    }
  }, [agents]);

  const sliderRefMobile = useRef<HTMLDivElement>(null);
  const sliderRefDesktop = useRef<HTMLDivElement>(null);
  const activeRef = isMobile ? sliderRefMobile : sliderRefDesktop;

  const handleChangeBase = (slider: KeenSliderInstance, isMobile: boolean) => {
    const center = slider.track.details.rel;
    setActiveIdx(center);

    const newId = agents[center]?.fa_id ?? null;
    setActiveId(newId);

    slider.track.details.slides.forEach((_, idx) => {
      const el = innerRefs.current[idx];
      if (!el) return;
      const isActive = idx === center;
      el.style.transform = isActive
        ? "scale(1)"
        : isMobile
        ? "scale(0.4)"
        : "scale(0.8)";
      el.style.opacity = isActive ? "1" : isMobile ? "0.25" : "0.5";
      el.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    });
  };

  const handleChangeMobile = useCallback(
    (slider: KeenSliderInstance) => handleChangeBase(slider, true),
    []
  );

  const handleChangeDesktop = useCallback(
    (slider: KeenSliderInstance) => handleChangeBase(slider, false),
    []
  );

  const isLooped = false;

  const [sliderRefM, instanceRefMobile] = useKeenSlider<HTMLDivElement>({
    loop: isLooped,
    initial: initialIndex,
    slides: {
      perView: 3,
      spacing: 2,
      origin: "center",
    },
    detailsChanged: handleChangeMobile,
    slideChanged: handleChangeMobile,
    created: handleChangeMobile,
  });

  const [sliderRefD, instanceRefDesktop] = useKeenSlider<HTMLDivElement>({
    loop: isLooped,
    initial: initialIndex,
    slides: {
      perView: 3,
      spacing: 2,
      origin: "center",
    },
    detailsChanged: handleChangeDesktop,
    slideChanged: handleChangeDesktop,
    created: handleChangeDesktop,
  });

  useEffect(() => {
    const el = activeRef.current;
    if (el) {
      const assign = isMobile ? sliderRefM : sliderRefD;
      assign(el);
    }
  }, [isMobile, sliderRefM, sliderRefD, activeRef]);

  const instanceRef = isMobile ? instanceRefMobile : instanceRefDesktop;

  return (
    <Flex
      justify="center"
      align="center"
      maxW={{ base: "100vw", md: "100%" }}
      mx={{ base: 2, md: 0 }}
      position="relative"
    >
      <Button
        aria-label="Previous"
        zIndex={2}
        bg="transparent"
        border="none"
        onClick={() => instanceRef.current?.prev()}
        userSelect="none"
        padding={0}
        position={{ sm: "absolute", md: "relative" }}
        left={6}
      >
        <ChevronLeftIcon h={6} />
      </Button>

      <Flex
        justify="center"
        maxW={{ base: "99%", md: "100%" }}
        px={{ base: 1, md: 4 }}
        h="300px"
      >
        <Box
          ref={activeRef}
          className="keen-slider"
          overflow="visible"
          w="100%"
          maxW={{ base: "unset", md: "800px" }}
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 1%, black 99%, transparent)",
          }}
        >
          {agents.map((agent, i) => {
            return (
              <Box
                key={agent.fa_id}
                className="keen-slider__slide"
                overflow="visible !important"
                display="flex"
                justifyContent="center"
                alignItems="center"
                maxW="33% !important"
                mr={isLooped && i === agents.length - 1 ? 200 : 0}
                zIndex={activeIdx === i ? 1 : 0}
              >
                <Box
                  ref={(el: HTMLDivElement) => {
                    if (el) innerRefs.current[i] = el;
                  }}
                  transformOrigin="center"
                >
                  <AgentCard isActive={activeIdx === i} agent={agent} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Flex>

      <Button
        aria-label="Next"
        zIndex={2}
        bg="transparent"
        border="none"
        onClick={() => instanceRef.current?.next()}
        userSelect="none"
        padding={0}
        position={{ sm: "absolute", md: "relative" }}
        right={6}
      >
        <ChevronRightIcon h={6} />
      </Button>
    </Flex>
  );
};
