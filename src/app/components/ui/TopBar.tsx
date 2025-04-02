import { Box, Flex } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import TopBarClient from "./TopBarClient";

export default function TopBar() {
  return (
    <Flex alignItems="center" justifyContent="space-between" minHeight="50px" py={2}>
      <Box ml="2rem">
        <Link href="/home">
          <Box display={{ base: "none", md: "block" }}>
            <Image
              src="/logo.png"
              alt="logo"
              style={{
                width: "100%",
                height: "auto",
              }}
              width={200}
              height={40}
              sizes="200px"
            />
          </Box>
          <Box display={{ base: "block", md: "none" }}>
            <Image
              src="/logo-mobile.png"
              alt="logo"
              style={{
                width: "100%",
                height: "auto",
              }}
              width={40}
              height={40}
              sizes="40px"
            />
          </Box>
        </Link>
      </Box>
      <TopBarClient />
    </Flex>
  );
}
