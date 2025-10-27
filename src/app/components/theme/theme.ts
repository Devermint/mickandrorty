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
          a0: { value: "#0C0C0C" },
          a1: { value: "#090A0B" },
          a2: { value: "#121315" },
          a3: { value: "#1A1D1F" },
        },
        green: {
          dark: { value: "#282A28" },
          erin: { value: "#51FE53" },
          darkErin: { value: "#349F35" },
          salad: { value: "#46DD0B" },
          brightErin: { value: "#5DFF00" },
          700: { value: "#175200" },
        },
        gray: {
          timberwolf: { value: "#C7CAC8" },
          platinum: { value: "#6A6B6A" },
          tertiary: { value: "#A6A6A6" },
          disabled: { value: "#6B6B6B" },
          200: { value: "#8E8E8E" },
          300: { value: "#2A2A2A" },
          400: { value: "#2B2B2B" },
          500: { value: "#262729" },
          tertiaryAlpha12: { value: "rgba(120, 120, 128, 0.12)" },
          tertiaryDark: { value: "#181818" },
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
    a0: "blackCustom.a0",
    a1: "blackCustom.a1",
    a2: "blackCustom.a2",
    a3: "blackCustom.a3",
  },
  green: {
    dark: "green.dark",
    erin: "green.erin",
    darkErin: "green.darkErin",
    700: "green.700",
    salad: "green.salad",
    brightErin: "green.brightErin",
  },
  gray: {
    timberwolf: "gray.timberwolf",
    platinum: "gray.platinum",
    dark: "gray.dark",
    tertiary: "gray.tertiary",
    disabled: "gray.disabled",
    tertiaryDark: "gray.tertiaryDark",
    tertiaryAlpha12: "gray.tertiaryAlpha12",
    200: "gray.200",
    300: "gray.300",
    400: "gray.400",
    500: "gray.500",
  },
  blue: {
    dark: "blue.dark",
  },
} as const;

const config = deepmerge(defaultConfig, customConfig);
export const system = createSystem(config);
