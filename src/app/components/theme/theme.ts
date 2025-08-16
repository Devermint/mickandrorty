import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react";
import deepmerge from "deepmerge";
import { sora } from "./fonts";

const buttonRecipe = defineRecipe({
  base: {
    fontFamily: sora.style.fontFamily,
    background: "#1A1D1F",
    borderWidth: "1px",
    borderColor: "#282A28",
    borderRadius: "14px",
    color: "#B1B3B9",
    fontWeight: 400,
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
    fontFamily: sora.style.fontFamily,
    color: "#B1B3B9",
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
        blue: {
          dark: { value: "#393C46" },
        },
      },
      // ...({
      //   typography: {
      //     textStyles,
      //   },
      // } as any),
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
    dark: "gray.dark",
  },
  blue: {
    dark: "blue.dark",
  },
} as const;

const config = deepmerge(defaultConfig, customConfig);
export const system = createSystem(config);
