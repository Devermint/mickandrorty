"use client";

import { useRef, useState } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider";
import "keen-slider/keen-slider.min.css";
import { Agent } from "@/app/types/agent";
import { ChevronLeftIcon } from "../icons/chevronLeft";
import { ChevronRightIcon } from "../icons/chevronRight";
import { AgentCard } from "./AgentCard";
import { useMobileBreak } from "../responsive";

type AgentCarouselProps = {
  agents: Agent[];
};

export const AgentCarousel = ({ agents }: AgentCarouselProps) => {
  const innerRefs = useRef<HTMLDivElement[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const isMobile = useMobileBreak();

  const handleChange = (slider: KeenSliderInstance) => {
    const center = slider.track.details.rel;
    setActiveIdx(center);

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

  const isLooped = false;

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: isLooped,
    initial: 1,
    slides: {
      perView: 3,
      spacing: 2,
      origin: "center",
    },
    detailsChanged: handleChange,
    slideChanged: handleChange,
  });

  return (
    <Flex justify="center" align="center" maxW="100%">
      <Button
        aria-label="Previous"
        zIndex={2}
        bg="transparent"
        border="none"
        onClick={() => instanceRef.current?.prev()}
        userSelect="none"
        padding={0}
        position={isMobile ? "absolute" : "relative"}
        left={0}
      >
        <ChevronLeftIcon h={6} />
      </Button>

      <Flex justify="center" maxW="90%" px={4} h="300px">
        <Box
          ref={sliderRef}
          className="keen-slider"
          overflow="visible"
          w="100%"
          maxW="800px"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 1%, black 99%, transparent)",
          }}
        >
          {agents.map((agent, i) => (
            <Box
              key={i}
              className="keen-slider__slide"
              overflow="visible !important"
              display="flex"
              justifyContent="center"
              alignItems="center"
              maxW="33% !important"
              mr={isLooped && i === agents.length - 1 ? 200 : 0}
              zIndex={i === activeIdx ? 1 : 0}
            >
              <Box
                ref={(el: HTMLDivElement) => {
                  if (el) innerRefs.current[i] = el;
                }}
                transformOrigin="center"
              >
                <AgentCard isActive={i === activeIdx} agent={agent} />
              </Box>
            </Box>
          ))}
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
        position={isMobile ? "absolute" : "relative"}
        right={0}
      >
        <ChevronRightIcon h={6} />
      </Button>
    </Flex>
  );
};
