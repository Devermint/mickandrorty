"use client";

import { Image } from "@chakra-ui/react";
import Link from "next/link";

type Props = {
  height?: string;
  src?: string;
};

export const Logo = ({ height = "100%", src }: Props) => (
  <Link href="https://aptoslayer.ai/">
    <Image
      src={src ?? "/img/new/logo2.webp"}
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
