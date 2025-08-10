import { defineTextStyles } from "@chakra-ui/react";
import { bebasNeue, sora } from "./fonts";

export const textStyles = defineTextStyles({
  hero: {
    description: "Hero title",
    value: {
      fontFamily: bebasNeue.style.fontFamily,
      fontSize: "58px",
      lineHeight: "100%",
      textTransform: "uppercase",
      letterSpacing: "tight",
    },
  },
  bodyLarge: {
    description: "Body text h1 (Sora 16px)",
    value: {
      fontFamily: sora.style.fontFamily,
      fontSize: "16px",
      fontWeight: "600",
      lineHeight: "1.4",
    },
  },
  bodySmall: {
    description: "Body text h2 (Sora 14px)",
    value: {
      fontFamily: sora.style.fontFamily,
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "1.4",
    },
  },
});
