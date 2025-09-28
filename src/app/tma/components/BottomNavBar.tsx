"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Text, Link } from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";
import { HomeIcon } from "./icons/HomeIcon";
import { TasksIcon } from "./icons/TasksIcon";
import { FriendsIcon } from "./icons/FriendsIcon";

const navItems = [
  { href: "/tma/home", label: "Home", icon: HomeIcon },
  { href: "/tma/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/tma/friends", label: "Friends", icon: FriendsIcon },
];

export const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={colorTokens.blackCustom.a2}
      borderTop="1px solid"
      borderColor="gray.700"
      zIndex="sticky"
    >
      <Flex as="nav" justify="space-around" align="center" h="60px">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} as={NextLink} href={href} _hover={{ textDecoration: "none" }}>
              <Flex direction="column" align="center" justify="center" h="100%">
                <Icon color={isActive ? colorTokens.blue : "gray.500"} boxSize={6} />
                <Text fontSize="xs" color={isActive ? colorTokens.blue : "gray.500"} mt={1}>
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
