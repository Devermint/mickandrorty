"use client";

import { Image } from "@chakra-ui/react";
import Link from "next/link";

type Props = {
  height?: string;
};

export const Logo = ({ height = "100%" }: Props) => (
  <Link href="https://aptoslayer.ai/">
    <Image
      py={3}
      src="/logo.png"
      alt="logo"
      style={{
        objectFit: "contain",
        height,
        width: "auto",
        maxHeight: "100%",
      }}
    />
  </Link>
);
