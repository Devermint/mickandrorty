"use client";

import { Box, Image } from "@chakra-ui/react";
import Link from "next/link";

type LogoProps = {
  height?: string;
};

export const Logo = ({ height = "80px" }: LogoProps) => (
  <Link href="https://aptoslayer.ai/">
    <Box>
      <Image
        src="/logo.png"
        alt="logo"
        style={{
          objectFit: "contain",
          height,
          width: "auto",
          maxHeight: "100%",
        }}
        height={100}
        width={100}
      />
    </Box>
  </Link>
);
