"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Text, Link } from "@chakra-ui/react";
import { HomeIcon } from "@/app/components/icons/HomeIcon";
import { TasksIcon } from "@/app/components/icons/TasksIcon";
import { FriendsIcon } from "@/app/components/icons/FriendsIcon";

const navItems = [
  { href: "/tma/home", label: "Home", icon: HomeIcon },
  { href: "/tma/leaderboard", label: "Leaderboard", icon: TasksIcon },
];

export const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <Box
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      bg="gray.900"
      borderTop="1px solid"
      borderColor="gray.700"
      zIndex={10}
    >
      <Flex as="nav" justify="space-around" align="center" h="60px">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} as={NextLink} href={href} _hover={{ textDecoration: "none" }}>
              <Flex direction="column" align="center" justify="center" h="100%">
                <Icon as={Icon} color={isActive ? "blue.400" : "gray.500"} boxSize={6} />
                <Text fontSize="xs" color={isActive ? "blue.400" : "gray.500"} mt={1}>
                  {label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
};
