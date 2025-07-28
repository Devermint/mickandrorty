import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react";
import deepmerge from "deepmerge";

const buttonRecipe = defineRecipe({
  base: {
    background: "#1D3114",
    borderWidth: "1px",
    borderColor: "#AFDC296E",
    borderRadius: "14px",
    color: "#AFDC29",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "24px",
  },
  variants: {
    social: {
      true: {
        background: "#042911",
      },
    },
  },
});

const textRecipe = defineRecipe({
  base: {
    color: "#AFDC29",
  },
});

const customConfig = defineConfig({
  theme: {
    recipes: {
      button: buttonRecipe,
      text: textRecipe,
    },
    keyframes: {
      bounce1: {
        "0%": { transform: "scale(1, 1)" },
        "25%": { transform: "scale(1, 1.5)" },
        "50%": { transform: "scale(1, 0.67)" },
        "75%": { transform: "scale(1, 1)" },
        "100%": { transform: "scale(1, 1)" },
      },
      bounce2: {
        "0%": { transform: "scale(1, 1)" },
        "25%": { transform: "scale(1, 1)" },
        "50%": { transform: "scale(1, 1.5)" },
        "75%": { transform: "scale(1, 1)" },
        "100%": { transform: "scale(1, 1)" },
      },
      bounce3: {
        "0%": { transform: "scale(1, 1)" },
        "25%": { transform: "scale(1, 1)" },
        "50%": { transform: "scale(1, 0.67)" },
        "75%": { transform: "scale(1, 1.5)" },
        "100%": { transform: "scale(1, 1)" },
      },
    },
    tokens: {
      colors: {
        textGray: {
          value: "#B1B3B9",
        },
        blackCustom: {
          a1: { value: "#090A0B" },
          a2: { value: "#121315" },
          a3: { value: "#1A1D1F" },
        },
        green: {
          dark: { value: "#282A28" },
          erin: { value: "#51FE53" },
          darkErin: { value: "#349F35" },
        },
        gray: {
          timberwolf: { value: "#C7CAC8" },
          platinum: { value: "#6A6B6A" },
        },
      },
    },
  },
});

export const colorTokens = {
  textGray: "textGray",
  blackCustom: {
    a1: "blackCustom.a1",
    a2: "blackCustom.a2",
    a3: "blackCustom.a3",
  },
  green: {
    dark: "green.dark",
    erin: "green.erin",
    darkErin: "green.darkErin",
  },
  gray: {
    timberwolf: "gray.timberwolf",
    platinum: "gray.platinum",
  },
} as const;

const config = deepmerge(defaultConfig, customConfig);
export const system = createSystem(config);
