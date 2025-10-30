"use client";

import { Box, Flex, Icon } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colorTokens } from "../theme/theme";
import { PiRobot, PiCoins, PiTicket, PiSparkle } from "react-icons/pi";

const footerItems = [
  { label: "Agents", href: "/agents", icon: PiRobot },
  { label: "Predictions", href: "/predictions", icon: PiCoins },
  { label: "Earn", href: "/referrals", icon: PiTicket },
  { label: "Create", href: "/", icon: PiSparkle },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/" || pathname === "";
  }

  return pathname.startsWith(href);
};

export const MobileFooter = () => {
  const pathname = usePathname();
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (!footerRef.current) return;
      const height = footerRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--mobile-footer-height",
        `${height}px`
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      document.documentElement.style.removeProperty("--mobile-footer-height");
    };
  }, []);

  if (!pathname || pathname.startsWith("/agent/")) {
    return null;
  }

  return (
    <Flex
      ref={footerRef}
      position="sticky"
      bottom={0}
      w="100%"
      zIndex={30}
      bg={colorTokens.blackCustom.a1}
      borderTopWidth="1px"
      borderColor={colorTokens.green.dark}
      display={{ base: "flex", md: "none" }}
      mt="auto"
      pb="env(safe-area-inset-bottom)"
      minH="56px"
    >
      {footerItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            style={{ flex: 1, textDecoration: "none" }}
          >
            <Flex
              flexDir="column"
              align="center"
              justify="center"
              gap="2px"
              h="56px"
              pb={1}
              color={active ? colorTokens.green.salad : "gray.300"}
              transition="color 0.2s ease"
            >
              <Icon as={item.icon} boxSize={5} />
              <Box fontSize="xs">{item.label}</Box>
            </Flex>
          </Link>
        );
      })}
    </Flex>
  );
};
